import { activityColorClasses } from '@/domain/labels';
import type { ActivityMinutes } from '@/domain/load';

const numberFormat = new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 0 });

/** Horizontal bars of total minutes per activity over the window. */
export function ActivityMinutesChart({ data }: { data: ActivityMinutes[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Aucune séance sur la période.</p>
    );
  }

  const max = Math.max(...data.map((d) => d.minutes));

  return (
    <ul className="flex flex-col gap-2">
      {data.map(({ activity, minutes }) => (
        <li key={activity.id} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>{activity.name}</span>
            <span>{numberFormat.format(minutes)} min</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={`h-full rounded-full ${activityColorClasses[activity.color]}`}
              style={{ width: `${(minutes / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
