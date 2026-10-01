import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { deleteActivity, updateActivity } from '@/db/activityRepo';
import {
  ACTIVITY_CATEGORIES,
  activityCategoryLabels,
  activityColorClasses,
  type ActivityCategory,
  type ActivityColor,
} from '@/domain/labels';
import type { Activity } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Field } from '@/ui/Field';
import { ColorPicker } from './ColorPicker';

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function ActivityRow({
  activity,
  isFirst,
  isLast,
  onMove,
}: {
  activity: Activity;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(activity.name);
  const [category, setCategory] = useState<ActivityCategory>(activity.category);
  const [color, setColor] = useState<ActivityColor>(activity.color);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string>();

  async function saveEdit() {
    const trimmed = name.trim();
    if (trimmed) {
      await updateActivity(activity.id, { name: trimmed, category, color });
    }
    setEditing(false);
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    try {
      await deleteActivity(activity.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 py-2 dark:border-slate-800">
      {editing ? (
        <div className="flex flex-col gap-3">
          <Field label="Nom" htmlFor={`activity-name-${activity.id}`}>
            <input
              id={`activity-name-${activity.id}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Catégorie" htmlFor={`activity-category-${activity.id}`}>
            <select
              id={`activity-category-${activity.id}`}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ActivityCategory);
              }}
              className={inputClass}
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {activityCategoryLabels[c]}
                </option>
              ))}
            </select>
          </Field>
          <ColorPicker value={color} onChange={setColor} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                void saveEdit();
              }}
            >
              OK
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-3 w-3 shrink-0 rounded-full ${activityColorClasses[activity.color]}`}
            />
            <div className="flex min-h-11 flex-col justify-center">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {activity.name}
                {activity.archived && (
                  <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Archivée
                  </span>
                )}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activityCategoryLabels[activity.category]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              aria-label={`Monter ${activity.name}`}
              disabled={isFirst}
              onClick={() => {
                onMove(-1);
              }}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-slate-100 disabled:opacity-40 dark:bg-slate-800"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Descendre ${activity.name}`}
              disabled={isLast}
              onClick={() => {
                onMove(1);
              }}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-slate-100 disabled:opacity-40 dark:bg-slate-800"
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(true);
              }}
            >
              Modifier
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void updateActivity(activity.id, { archived: !activity.archived });
              }}
            >
              {activity.archived ? 'Désarchiver' : 'Archiver'}
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
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer l'activité ?"
        description="Impossible si l'activité est utilisée par des séances : archive-la plutôt."
        destructive
        confirmLabel="Supprimer"
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => {
          setConfirmingDelete(false);
        }}
      />
    </div>
  );
}
