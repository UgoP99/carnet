import { useId, useState } from 'react';
import { createTechnique } from '@/db/techniqueRepo';
import { POSITIONS, positionLabels, type Position } from '@/domain/labels.grappling';
import type { Technique } from '@/domain/schemas';
import { normalize } from '@/lib/text';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import type { TechniqueLogDraft } from './sessionFormValues';

interface TechniquePickerProps {
  techniques: Technique[];
  logs: TechniqueLogDraft[];
  onChange: (logs: TechniqueLogDraft[]) => void;
}

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function TechniquePicker({ techniques, logs, onChange }: TechniquePickerProps) {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [newPosition, setNewPosition] = useState<Position>('standing');
  const [error, setError] = useState<string>();
  const positionFieldId = useId();

  const selectedIds = new Set(logs.map((l) => l.techniqueId));
  const trimmedQuery = query.trim();
  const matches =
    trimmedQuery.length === 0
      ? []
      : techniques
          .filter((t) => !t.archived && !selectedIds.has(t.id))
          .filter((t) => normalize(t.name).includes(normalize(trimmedQuery)))
          .slice(0, 8);

  function addLog(techniqueId: string, techniqueName: string) {
    onChange([...logs, { logId: undefined, techniqueId, techniqueName, text: '' }]);
    setQuery('');
    setCreating(false);
  }

  function removeLog(index: number) {
    onChange(logs.filter((_, i) => i !== index));
  }

  function updateText(index: number, text: string) {
    onChange(logs.map((l, i) => (i === index ? { ...l, text } : l)));
  }

  async function createAndAdd() {
    if (!trimmedQuery) return;
    try {
      const technique = await createTechnique({
        name: trimmedQuery,
        position: newPosition,
        perspective: 'neutral',
        type: 'concept',
        attire: 'both',
        tags: [],
        videoLinks: [],
      });
      addLog(technique.id, technique.name);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Techniques vues
      </span>

      {logs.map((log, index) => (
        <div
          key={`${log.techniqueId}-${index}`}
          className="flex flex-col gap-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {log.techniqueName}
            </span>
            <button
              type="button"
              aria-label={`Retirer ${log.techniqueName}`}
              onClick={() => {
                removeLog(index);
              }}
              className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 dark:text-slate-400"
            >
              ×
            </button>
          </div>
          <label htmlFor={`technique-detail-${log.techniqueId}-${index}`} className="sr-only">
            Détail pour {log.techniqueName}
          </label>
          <textarea
            id={`technique-detail-${log.techniqueId}-${index}`}
            placeholder="Détail important (optionnel)"
            rows={2}
            value={log.text}
            onChange={(e) => {
              updateText(index, e.target.value);
            }}
            className={`${inputClass} w-full resize-none py-2`}
          />
        </div>
      ))}

      <input
        type="text"
        aria-label="Rechercher ou créer une technique"
        placeholder="Chercher une technique…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCreating(false);
        }}
        className={inputClass}
      />

      {matches.length > 0 && (
        <div className="flex flex-col gap-1">
          {matches.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                addLog(t.id, t.name);
              }}
              className="min-h-11 rounded-lg border border-slate-200 px-3 text-left text-sm dark:border-slate-700"
            >
              {t.name}{' '}
              <span className="text-slate-500 dark:text-slate-400">
                ({positionLabels[t.position]})
              </span>
            </button>
          ))}
        </div>
      )}

      {trimmedQuery.length > 0 && !creating && (
        <Button
          variant="secondary"
          onClick={() => {
            setCreating(true);
          }}
        >
          + Créer « {trimmedQuery} »
        </Button>
      )}

      {creating && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Field label="Position" htmlFor={positionFieldId}>
            <select
              id={positionFieldId}
              value={newPosition}
              onChange={(e) => {
                setNewPosition(e.target.value as Position);
              }}
              className={inputClass}
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {positionLabels[p]}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCreating(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                void createAndAdd();
              }}
            >
              Créer et ajouter
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
