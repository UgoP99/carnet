import { useState } from 'react';
import { createExercise } from '@/db/exerciseRepo';
import {
  EXERCISE_METRICS,
  exerciseMetricLabels,
  MUSCLE_GROUPS,
  muscleGroupLabels,
  type ExerciseMetric,
  type MuscleGroup,
} from '@/domain/labels';
import type { Exercise } from '@/domain/schemas';
import { normalize } from '@/lib/text';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';

interface ExercisePickerProps {
  exercises: Exercise[];
  excludeIds: string[];
  onPick: (exercise: Exercise) => void;
}

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function ExercisePicker({ exercises, excludeIds, onPick }: ExercisePickerProps) {
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('legs');
  const [metric, setMetric] = useState<ExerciseMetric>('weight_reps');
  const [error, setError] = useState<string>();

  const excluded = new Set(excludeIds);
  const trimmedQuery = query.trim();
  const matches =
    trimmedQuery.length === 0
      ? []
      : exercises
          .filter((e) => !e.archived && !excluded.has(e.id))
          .filter((e) => normalize(e.name).includes(normalize(trimmedQuery)))
          .slice(0, 8);

  function pick(exercise: Exercise) {
    onPick(exercise);
    setQuery('');
    setCreating(false);
  }

  async function createAndPick() {
    if (!trimmedQuery) return;
    try {
      const exercise = await createExercise({ name: trimmedQuery, muscleGroup, metric });
      pick(exercise);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        aria-label="Rechercher ou créer un exercice"
        placeholder="Chercher un exercice…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCreating(false);
        }}
        className={inputClass}
      />

      {matches.length > 0 && (
        <div className="flex flex-col gap-1">
          {matches.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                pick(e);
              }}
              className="min-h-11 rounded-lg border border-slate-200 px-3 text-left text-sm dark:border-slate-700"
            >
              {e.name}{' '}
              <span className="text-slate-500 dark:text-slate-400">
                ({muscleGroupLabels[e.muscleGroup]})
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
          <Field label="Groupe musculaire" htmlFor="exercise-muscle-group">
            <select
              id="exercise-muscle-group"
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
          <Field label="Métrique" htmlFor="exercise-metric">
            <select
              id="exercise-metric"
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
                setCreating(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                void createAndPick();
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
