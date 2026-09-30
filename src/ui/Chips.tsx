export interface ChipOption {
  value: string;
  label: string;
}

interface ChipsProps {
  options: ChipOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multi?: boolean;
  'aria-label': string;
}

export function Chips({ options, value, onChange, multi = false, ...rest }: ChipsProps) {
  function toggle(optionValue: string) {
    const isSelected = value.includes(optionValue);
    if (multi) {
      onChange(isSelected ? value.filter((v) => v !== optionValue) : [...value, optionValue]);
    } else {
      onChange(isSelected ? [] : [optionValue]);
    }
  }

  return (
    <div role="group" aria-label={rest['aria-label']} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              toggle(option.value);
            }}
            className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${
              selected
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
