export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  'aria-label': string;
}

export function Segmented({ options, value, onChange, ...rest }: SegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label={rest['aria-label']}
      className="inline-flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => {
              onChange(option.value);
            }}
            className={`min-h-11 rounded-md px-3 text-sm font-medium transition-colors ${
              checked
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
