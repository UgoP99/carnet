import type { ExerciseMetric } from '@/domain/labels';
import { Button } from '@/ui/Button';
import type { SetDraft } from './sessionFormValues';

interface SetsEditorProps {
  metric: ExerciseMetric;
  sets: SetDraft[];
  onChange: (sets: SetDraft[]) => void;
}

const numberInputClass =
  'min-h-11 w-20 rounded-lg border border-slate-300 bg-white px-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export const emptySet: SetDraft = {
  reps: '',
  weightKg: '',
  durationSec: '',
  distanceM: '',
  rir: '',
  warmup: false,
};

export function SetsEditor({ metric, sets, onChange }: SetsEditorProps) {
  function updateSet(index: number, patch: Partial<SetDraft>) {
    onChange(sets.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSet(index: number) {
    onChange(sets.filter((_, i) => i !== index));
  }

  function addSet() {
    onChange([...sets, sets[sets.length - 1] ?? emptySet]);
  }

  return (
    <div className="flex flex-col gap-2">
      {sets.map((set, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2">
          <span className="w-5 text-xs text-slate-500 dark:text-slate-400">{index + 1}</span>

          {metric === 'weight_reps' && (
            <>
              <input
                type="number"
                inputMode="decimal"
                aria-label={`Set ${index + 1} — charge (kg)`}
                placeholder="kg"
                min={0}
                step={0.25}
                value={set.weightKg}
                onChange={(e) => {
                  updateSet(index, { weightKg: e.target.value });
                }}
                className={numberInputClass}
              />
              <input
                type="number"
                inputMode="numeric"
                aria-label={`Set ${index + 1} — répétitions`}
                placeholder="reps"
                min={0}
                value={set.reps}
                onChange={(e) => {
                  updateSet(index, { reps: e.target.value });
                }}
                className={numberInputClass}
              />
            </>
          )}

          {metric === 'reps' && (
            <input
              type="number"
              inputMode="numeric"
              aria-label={`Set ${index + 1} — répétitions`}
              placeholder="reps"
              min={0}
              value={set.reps}
              onChange={(e) => {
                updateSet(index, { reps: e.target.value });
              }}
              className={numberInputClass}
            />
          )}

          {metric === 'time' && (
            <input
              type="number"
              inputMode="numeric"
              aria-label={`Set ${index + 1} — durée (s)`}
              placeholder="sec"
              min={1}
              value={set.durationSec}
              onChange={(e) => {
                updateSet(index, { durationSec: e.target.value });
              }}
              className={numberInputClass}
            />
          )}

          {metric === 'distance' && (
            <input
              type="number"
              inputMode="numeric"
              aria-label={`Set ${index + 1} — distance (m)`}
              placeholder="m"
              min={1}
              value={set.distanceM}
              onChange={(e) => {
                updateSet(index, { distanceM: e.target.value });
              }}
              className={numberInputClass}
            />
          )}

          <input
            type="number"
            inputMode="numeric"
            aria-label={`Set ${index + 1} — RIR`}
            placeholder="RIR"
            min={0}
            max={5}
            value={set.rir}
            onChange={(e) => {
              updateSet(index, { rir: e.target.value });
            }}
            className={`${numberInputClass} w-16`}
          />

          <label className="flex min-h-11 items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={set.warmup}
              onChange={(e) => {
                updateSet(index, { warmup: e.target.checked });
              }}
              className="h-5 w-5"
            />
            Warm-up
          </label>

          <button
            type="button"
            aria-label={`Retirer le set ${index + 1}`}
            onClick={() => {
              removeSet(index);
            }}
            className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 dark:text-slate-400"
          >
            ×
          </button>
        </div>
      ))}

      <Button variant="secondary" onClick={addSet}>
        + Ajouter un set
      </Button>
    </div>
  );
}
