const numberFormat = new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 0 });

export function GoalBar({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span>
          {numberFormat.format(value)} / {numberFormat.format(target)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={target}
        className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
      >
        <div className="h-full rounded-full bg-sky-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
