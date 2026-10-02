import {
  ACTIVITY_COLORS,
  activityColorClasses,
  activityColorLabels,
  type ActivityColor,
} from '@/domain/labels';

export function ColorPicker({
  value,
  onChange,
}: {
  value: ActivityColor;
  onChange: (color: ActivityColor) => void;
}) {
  return (
    <div role="group" aria-label="Couleur" className="flex flex-wrap gap-2">
      {ACTIVITY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={activityColorLabels[color]}
          aria-pressed={value === color}
          onClick={() => {
            onChange(color);
          }}
          className="flex min-h-11 min-w-11 items-center justify-center"
        >
          <span
            aria-hidden="true"
            className={`h-8 w-8 rounded-full ${activityColorClasses[color]} ${
              value === color ? 'ring-2 ring-offset-2 ring-sky-600 dark:ring-offset-slate-950' : ''
            }`}
          />
        </button>
      ))}
    </div>
  );
}
