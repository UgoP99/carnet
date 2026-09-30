interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}

export function Stepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label,
}: StepperProps) {
  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        aria-label={`Diminuer ${label}`}
        onClick={() => {
          onChange(clamp(value - step));
        }}
        disabled={value <= min}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-slate-100 text-lg font-semibold disabled:opacity-40 dark:bg-slate-800"
      >
        −
      </button>
      <span className="min-w-8 text-center text-base font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Augmenter ${label}`}
        onClick={() => {
          onChange(clamp(value + step));
        }}
        disabled={value >= max}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-slate-100 text-lg font-semibold disabled:opacity-40 dark:bg-slate-800"
      >
        +
      </button>
    </div>
  );
}
