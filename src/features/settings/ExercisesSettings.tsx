import { useState } from 'react';
import { useExercises } from '@/db/hooks';
import { createExercise, deleteExercise, updateExercise } from '@/db/exerciseRepo';
import {
  EXERCISE_METRICS,
  exerciseMetricLabels,
  MUSCLE_GROUPS,
  muscleGroupLabels,
  type ExerciseMetric,
  type MuscleGroup,
} from '@/domain/labels';
import type { Exercise } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { Chips } from '@/ui/Chips';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Field } from '@/ui/Field';

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string>();

  async function saveRename() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== exercise.name) {
      await updateExercise(exercise.id, { name: trimmed });
    }
    setRenaming(false);
  }

  async function handleDelete() {
    setConfirmingDelete(false);
    try {
      await deleteExercise(exercise.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 py-2 dark:border-slate-800">
      {renaming ? (
        <div className="flex items-center gap-2">
          <input
            aria-label={`Nom de ${exercise.name}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            className={`${inputClass} flex-1`}
          />
          <Button
            onClick={() => {
              void saveRename();
            }}
          >
            OK
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-h-11 flex-col justify-center">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {exercise.name}
              {exercise.archived && (
                <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Archivé
                </span>
              )}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {muscleGroupLabels[exercise.muscleGroup]} · {exerciseMetricLabels[exercise.metric]}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setRenaming(true);
              }}
            >
              Renommer
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void updateExercise(exercise.id, { archived: !exercise.archived });
              }}
            >
              {exercise.archived ? 'Désarchiver' : 'Archiver'}
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
        title="Supprimer l'exercice ?"
        description="Impossible si l'exercice est utilisé dans une séance ; archive-le dans ce cas."
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

export function ExercisesSettings() {
  const exercises = useExercises();
  const [showArchived, setShowArchived] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('legs');
  const [metric, setMetric] = useState<ExerciseMetric>('weight_reps');

  async function addExercise() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createExercise({ name: trimmed, muscleGroup, metric });
    setName('');
    setMuscleGroup('legs');
    setMetric('weight_reps');
    setAdding(false);
  }

  const visible = (exercises ?? [])
    .filter((e) => showArchived || !e.archived)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  if (exercises === undefined) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Exercices</h1>

      <Chips
        aria-label="Exercices archivés"
        multi
        options={[{ value: 'archived', label: 'Voir les archivés' }]}
        value={showArchived ? ['archived'] : []}
        onChange={(v) => {
          setShowArchived(v.includes('archived'));
        }}
      />

      <div className="flex flex-col">
        {visible.map((exercise) => (
          <ExerciseRow key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {adding ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Field label="Nom" htmlFor="exercise-name">
            <input
              id="exercise-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Groupe musculaire" htmlFor="new-exercise-muscle-group">
            <select
              id="new-exercise-muscle-group"
              value={muscleGroup}
              onChange={(e) => {
                setMuscleGroup(e.target.value as MuscleGroup);
              }}
              className={inputClass}
            >
              {MUSCLE_GROUPS.map((m) => (
                <option key={m} value={m}>
                  {muscleGroupLabels[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Métrique" htmlFor="new-exercise-metric">
            <select
              id="new-exercise-metric"
              value={metric}
              onChange={(e) => {
                setMetric(e.target.value as ExerciseMetric);
              }}
              className={inputClass}
            >
              {EXERCISE_METRICS.map((m) => (
                <option key={m} value={m}>
                  {exerciseMetricLabels[m]}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAdding(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                void addExercise();
              }}
            >
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setAdding(true);
          }}
        >
          + Ajouter un exercice
        </Button>
      )}
    </div>
  );
}
