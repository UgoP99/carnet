import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTechnique, useTechniqueLogsForTechnique } from '@/db/hooks';
import { createTechniqueLog } from '@/db/techniqueLogRepo';
import { archiveTechnique, deleteTechnique, updateTechnique } from '@/db/techniqueRepo';
import {
  perspectiveLabels,
  positionLabels,
  techniqueAttireLabels,
  techniqueTypeLabels,
} from '@/domain/labels.grappling';
import { techniqueStats } from '@/domain/technique';
import { todayLocal } from '@/lib/dates';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Field } from '@/ui/Field';
import { SafeLink } from '@/ui/SafeLink';

export function TechniqueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const technique = useTechnique(id);
  const logs = useTechniqueLogsForTechnique(id);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState<string>();

  const sortedLogs = logs?.toSorted((a, b) => b.date.localeCompare(a.date));
  const { timesSeen, lastSeen } = techniqueStats(logs ?? []);

  async function handleArchiveToggle() {
    if (!id || !technique) return;
    try {
      if (technique.archived) {
        await updateTechnique(id, { archived: false });
      } else {
        await archiveTechnique(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteTechnique(id);
      void navigate('/techniques');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  async function handleAddNote() {
    if (!id || !noteText.trim()) return;
    try {
      await createTechniqueLog({ techniqueId: id, date: todayLocal(), text: noteText });
      setNoteText('');
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Technique</h1>

      {technique === undefined ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : (
        <>
          <div>
            <p className="text-lg font-medium text-slate-900 dark:text-white">
              {technique.name}
              {technique.archived && (
                <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-normal text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Archivée
                </span>
              )}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {positionLabels[technique.position]} · {perspectiveLabels[technique.perspective]} ·{' '}
              {techniqueTypeLabels[technique.type]} · {techniqueAttireLabels[technique.attire]}
            </p>
            {(timesSeen > 0 || lastSeen) && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vue {timesSeen}× {lastSeen && `· dernière le ${lastSeen}`}
              </p>
            )}
          </div>

          {technique.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {technique.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {technique.summary && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Points clés
              </h2>
              <p className="whitespace-pre-wrap break-words text-sm text-slate-900 dark:text-white">
                {technique.summary}
              </p>
            </div>
          )}

          {technique.videoLinks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Vidéos</h2>
              <ul className="flex flex-col gap-1">
                {technique.videoLinks.map((link, i) => (
                  <li key={`${link.url}-${i}`}>
                    <SafeLink
                      href={link.url}
                      className="text-sm font-medium text-sky-600 underline dark:text-sky-400"
                    >
                      {link.label || link.url}
                    </SafeLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Historique</h2>
            {sortedLogs && sortedLogs.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {sortedLogs.map((log) => (
                  <li key={log.id} className="text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {format(parseISO(log.date), 'EEE d MMM yyyy', { locale: fr })}
                    </span>
                    {log.sessionId && (
                      <>
                        {' · '}
                        <Link
                          to={`/sessions/${log.sessionId}`}
                          className="text-sky-600 underline dark:text-sky-400"
                        >
                          séance
                        </Link>
                      </>
                    )}
                    {log.text && (
                      <p className="whitespace-pre-wrap break-words text-slate-900 dark:text-white">
                        {log.text}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Pas encore vue.</p>
            )}
          </div>

          <Field label="Ajouter une note" htmlFor="technique-note">
            <div className="flex flex-col gap-2">
              <textarea
                id="technique-note"
                rows={2}
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                }}
                className="min-h-11 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  void handleAddNote();
                }}
              >
                Ajouter la note
              </Button>
            </div>
          </Field>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                void navigate(`/techniques/${id}/edit`);
              }}
            >
              Modifier
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void handleArchiveToggle();
              }}
            >
              {technique.archived ? 'Désarchiver' : 'Archiver'}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmingDelete(true);
              }}
            >
              Supprimer
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer la technique ?"
        description="Impossible si elle est référencée par des séances ou un plan de jeu — archive-la dans ce cas."
        destructive
        confirmLabel="Supprimer"
        onConfirm={() => {
          setConfirmingDelete(false);
          void handleDelete();
        }}
        onCancel={() => {
          setConfirmingDelete(false);
        }}
      />
    </div>
  );
}
