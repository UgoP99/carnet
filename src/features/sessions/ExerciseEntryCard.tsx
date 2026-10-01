import { useLastExerciseEntry } from '@/db/hooks';
import type { SetEntry } from '@/domain/schemas';
import { formatSet } from '@/domain/strength';
import { Button } from '@/ui/Button';
import { SetsEditor } from './SetsEditor';
import type { ExerciseEntryDraft, SetDraft } from './sessionFormValues';

interface ExerciseEntryCardProps {
  draft: ExerciseEntryDraft;
  canMoveUp: boolean;
  canMoveDown: boolean;
  currentSessionId: string | undefined;
  onChange: (draft: ExerciseEntryDraft) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function setToDraft(sets: SetEntry[]): SetDraft[] {
  return sets.map((s) => ({
    reps: s.reps !== undefined ? String(s.reps) : '',
    weightKg: s.weightKg !== undefined ? String(s.weightKg) : '',
    durationSec: s.durationSec !== undefined ? String(s.durationSec) : '',
    distanceM: s.distanceM !== undefined ? String(s.distanceM) : '',
    rir: s.rir !== undefined ? String(s.rir) : '',
    warmup: s.warmup,
  }));
}

export function ExerciseEntryCard({
  draft,
  canMoveUp,
  canMoveDown,
  currentSessionId,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ExerciseEntryCardProps) {
  const lastEntry = useLastExerciseEntry(draft.exerciseId, currentSessionId);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-slate-900 dark:text-white">{draft.exerciseName}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Monter ${draft.exerciseName}`}
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 disabled:opacity-30 dark:text-slate-400"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Descendre ${draft.exerciseName}`}
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 disabled:opacity-30 dark:text-slate-400"
          >
            ↓
          </button>
          <button
            type="button"
            aria-label={`Retirer ${draft.exerciseName}`}
            onClick={onRemove}
            className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 dark:text-slate-400"
          >
            ×
          </button>
        </div>
      </div>

      {lastEntry && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <span>
            Dernière fois : {lastEntry.sets.map((s) => formatSet(s, draft.metric)).join(', ')}
          </span>
          <Button
            variant="secondary"
            onClick={() => {
              onChange({ ...draft, sets: setToDraft(lastEntry.sets) });
            }}
          >
            Préremplir
          </Button>
        </div>
      )}

      <SetsEditor
        metric={draft.metric}
        sets={draft.sets}
        onChange={(sets) => {
          onChange({ ...draft, sets });
        }}
      />
    </div>
  );
}
