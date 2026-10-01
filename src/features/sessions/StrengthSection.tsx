import type { Exercise } from '@/domain/schemas';
import { ExerciseEntryCard } from './ExerciseEntryCard';
import { ExercisePicker } from './ExercisePicker';
import { emptySet } from './SetsEditor';
import type { ExerciseEntryDraft } from './sessionFormValues';

interface StrengthSectionProps {
  value: ExerciseEntryDraft[];
  onChange: (value: ExerciseEntryDraft[]) => void;
  exercises: Exercise[];
  currentSessionId: string | undefined;
}

export function StrengthSection({
  value,
  onChange,
  exercises,
  currentSessionId,
}: StrengthSectionProps) {
  function updateAt(index: number, draft: ExerciseEntryDraft) {
    onChange(value.map((d, i) => (i === index ? draft : d)));
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveBy(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const current = value[index];
    const other = value[target];
    if (!current || !other) return;
    const next = [...value];
    next[index] = other;
    next[target] = current;
    onChange(next);
  }

  function addExercise(exercise: Exercise) {
    onChange([
      ...value,
      {
        entryId: undefined,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        metric: exercise.metric,
        sets: [emptySet],
      },
    ]);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Exercices</span>

      {value.map((draft, index) => (
        <ExerciseEntryCard
          key={`${draft.exerciseId}-${index}`}
          draft={draft}
          canMoveUp={index > 0}
          canMoveDown={index < value.length - 1}
          currentSessionId={currentSessionId}
          onChange={(updated) => {
            updateAt(index, updated);
          }}
          onRemove={() => {
            removeAt(index);
          }}
          onMoveUp={() => {
            moveBy(index, -1);
          }}
          onMoveDown={() => {
            moveBy(index, 1);
          }}
        />
      ))}

      <ExercisePicker
        exercises={exercises}
        excludeIds={value.map((d) => d.exerciseId)}
        onPick={addExercise}
      />
    </div>
  );
}
