import { useRef, useState } from 'react';
import {
  applyImport,
  exportBackup,
  MAX_BACKUP_CHARS,
  previewImport,
  type ImportPreview,
} from '@/db/backup';
import { useLastExportAt } from '@/db/hooks';
import { setLastExportAt } from '@/db/metaRepo';
import { todayLocal } from '@/lib/dates';
import { shareOrDownloadFile } from '@/lib/share';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Field } from '@/ui/Field';
import { formatExportDate } from './formatExportDate';
import { Storage } from './Storage';

const TABLE_LABELS: Record<keyof ImportPreview['counts'], string> = {
  activities: 'Activités',
  sessions: 'Séances',
  techniques: 'Techniques',
  techniqueLogs: 'Détails de technique',
  exercises: 'Exercices',
  exerciseEntries: 'Blocs de renfo',
  gamePlans: 'Plans de jeu',
  gamePlanNodes: 'Nœuds de plan',
  meta: 'Réglages',
};

export function Backup() {
  const lastExportAt = useLastExportAt();
  const [exportError, setExportError] = useState<string>();
  const [exportMessage, setExportMessage] = useState<string>();
  const [importError, setImportError] = useState<string>();
  const [importMessage, setImportMessage] = useState<string>();
  const [preview, setPreview] = useState<ImportPreview>();
  const [pendingMode, setPendingMode] = useState<'replace' | 'merge'>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExportError(undefined);
    setExportMessage(undefined);
    try {
      const doc = await exportBackup();
      const filename = `carnet-backup-${todayLocal()}.json`;
      const outcome = await shareOrDownloadFile(
        filename,
        JSON.stringify(doc, null, 2),
        'application/json',
      );
      if (outcome === 'cancelled') return;
      await setLastExportAt(doc.exportedAt);
      setExportMessage(outcome === 'shared' ? 'Sauvegarde partagée.' : 'Sauvegarde téléchargée.');
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  async function handleFileSelected(file: File) {
    setImportError(undefined);
    setImportMessage(undefined);
    setPreview(undefined);
    if (file.size > MAX_BACKUP_CHARS) {
      setImportError('Fichier trop volumineux (25 Mo maximum).');
      return;
    }
    try {
      const raw = await file.text();
      setPreview(previewImport(raw));
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  async function handleApply(mode: 'replace' | 'merge') {
    if (!preview) return;
    try {
      await applyImport(preview, mode);
      setPreview(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImportMessage(mode === 'replace' ? 'Données remplacées.' : 'Données fusionnées.');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erreur inattendue.');
    } finally {
      setPendingMode(undefined);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Sauvegarde</h1>

      <section className="flex flex-col gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Dernier export : {formatExportDate(lastExportAt)}
        </p>
        <Button
          onClick={() => {
            void handleExport();
          }}
        >
          Exporter mes données
        </Button>
        {exportMessage && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{exportMessage}</p>
        )}
        {exportError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {exportError}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <Field
          label="Importer une sauvegarde"
          htmlFor="import-file"
          hint="Fichier JSON (25 Mo maximum)."
        >
          <input
            id="import-file"
            type="file"
            accept="application/json"
            ref={fileInputRef}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFileSelected(file);
            }}
            className="text-sm text-slate-600 dark:text-slate-400"
          />
        </Field>

        {importMessage && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{importMessage}</p>
        )}
        {importError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {importError}
          </p>
        )}

        {preview && (
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
            <p className="font-medium text-slate-900 dark:text-white">Aperçu</p>
            <ul className="text-slate-600 dark:text-slate-400">
              {Object.entries(preview.counts)
                .filter(([, count]) => count > 0)
                .map(([table, count]) => (
                  <li key={table}>
                    {TABLE_LABELS[table as keyof ImportPreview['counts']]} : {count}
                  </li>
                ))}
            </ul>
            {preview.orphansDropped > 0 && (
              <p className="text-amber-600 dark:text-amber-400">
                {preview.orphansDropped} référence(s) incohérente(s) ignorée(s).
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  setPendingMode('replace');
                }}
              >
                Remplacer tout
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setPendingMode('merge');
                }}
              >
                Fusionner
              </Button>
            </div>
          </div>
        )}
      </section>

      <Storage />

      <ConfirmDialog
        open={pendingMode !== undefined}
        title={
          pendingMode === 'replace' ? 'Remplacer toutes les données ?' : 'Fusionner les données ?'
        }
        description={
          pendingMode === 'replace'
            ? 'Toutes les données actuelles seront supprimées et remplacées par le contenu du fichier.'
            : 'Les données du fichier seront ajoutées ; en cas de conflit, la version la plus récente est conservée.'
        }
        destructive={pendingMode === 'replace'}
        confirmLabel={pendingMode === 'replace' ? 'Remplacer' : 'Fusionner'}
        onConfirm={() => {
          if (pendingMode) void handleApply(pendingMode);
        }}
        onCancel={() => {
          setPendingMode(undefined);
        }}
      />
    </div>
  );
}
