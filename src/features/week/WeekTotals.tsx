import { activityColorClasses } from '@/domain/labels';
import type { WeeklyTotals } from '@/domain/load';
import type { Activity } from '@/domain/schemas';

const numberFormat = new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 0 });

export function WeekTotals({
  totals,
  trendValue,
  activities,
}: {
  totals: WeeklyTotals;
  trendValue: number | null;
  activities: Activity[];
}) {
  const activitiesWithSessions = activities.filter((a) => totals.byActivity[a.id]);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-3 text-center dark:bg-slate-900">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{totals.sessions}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">séances</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {numberFormat.format(totals.minutes)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">minutes</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {numberFormat.format(totals.load)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">charge (UA)</p>
        </div>
      </div>

      {trendValue !== null && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {trendValue >= 1 ? '+' : ''}
          {numberFormat.format((trendValue - 1) * 100)} % vs moyenne 4 sem.
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {activitiesWithSessions.map((activity) => {
          const activityTotals = totals.byActivity[activity.id];
          if (!activityTotals) return null;
          return (
            <li
              key={activity.id}
              className="flex items-center justify-between gap-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full ${activityColorClasses[activity.color]}`}
                />
                {activity.name}
              </span>
              <span>
                {activityTotals.sessions} séance{activityTotals.sessions > 1 ? 's' : ''} ·{' '}
                {activityTotals.minutes} min
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
