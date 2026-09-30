import { RPE_LABELS } from '@/domain/labels';

interface RpeInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  label: string;
}

const VALUES = Array.from({ length: 10 }, (_, i) => i + 1);

export function RpeInput({ value, onChange, label }: RpeInputProps) {
  return (
    <div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-5 gap-2">
        {VALUES.map((n) => {
          const checked = n === value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => {
                onChange(n);
              }}
              className={`min-h-11 rounded-lg text-base font-semibold transition-colors ${
                checked
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {value ? RPE_LABELS[value] : 'Choisis une intensité'}
      </p>
    </div>
  );
}
