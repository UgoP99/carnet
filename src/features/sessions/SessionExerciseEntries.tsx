import type { Exercise, ExerciseEntry } from '@/domain/schemas';
import { bestSet, e1rm, formatSet } from '@/domain/strength';

interface SessionExerciseEntriesProps {
  entries: ExerciseEntry[];
  exercises: Exercise[];
}

export function SessionExerciseEntries({ entries, exercises }: SessionExerciseEntriesProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Exercices</h2>
      {entries.map((entry) => {
        const exercise = exercises.find((e) => e.id === entry.exerciseId);
        const metric = exercise?.metric ?? 'weight_reps';
        const best = bestSet(entry.sets, metric);
        return (
          <div key={entry.id} className="text-sm">
            <p className="font-medium text-slate-900 dark:text-white">
              {exercise?.name ?? 'Exercice supprimé'}
            </p>
            <ul>
              {entry.sets.map((set, i) => {
                const rm = e1rm(set);
                const isBest = best === set;
                return (
                  <li
                    key={i}
                    className={
                      isBest
                        ? 'font-medium text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }
                  >
                    {formatSet(set, metric)}
                    {set.warmup && ' (warm-up)'}
                    {rm !== null && ` — e1RM ${rm} kg`}
                    {isBest && ' ★'}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
