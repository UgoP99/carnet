import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ACTIVITY_CATEGORIES,
  activityCategoryDotClasses,
  activityCategoryFillClasses,
  activityCategoryLabels,
} from '@/domain/labels';
import type { WeekCategoryLoad } from '@/domain/load';
import { weekRange } from '@/lib/dates';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 90;
const BAR_GAP = 3;

function weekShortLabel(weekKey: string): string {
  return format(parseISO(weekRange(weekKey).start), 'd MMM', { locale: fr });
}

/** Stacked bar chart of weekly load by category, with an accessible table fallback. */
export function LoadChart({ weeks }: { weeks: WeekCategoryLoad[] }) {
  const categoriesPresent = ACTIVITY_CATEGORIES.filter((c) =>
    weeks.some((w) => (w.byCategory[c] ?? 0) > 0),
  );
  const maxTotal = Math.max(1, ...weeks.map((w) => w.total));
  const barWidth = (CHART_WIDTH - BAR_GAP * (weeks.length - 1)) / weeks.length;

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Charge hebdomadaire par catégorie, 12 dernières semaines"
      >
        {weeks.map((week, i) => {
          let y = CHART_HEIGHT;
          const x = i * (barWidth + BAR_GAP);
          return (
            <g key={week.weekKey}>
              {ACTIVITY_CATEGORIES.map((category) => {
                const value = week.byCategory[category] ?? 0;
                if (value === 0) return null;
                const height = (value / maxTotal) * CHART_HEIGHT;
                y -= height;
                return (
                  <rect
                    key={category}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    className={activityCategoryFillClasses[category]}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {categoriesPresent.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          {categoriesPresent.map((category) => (
            <li key={category} className="flex items-center gap-1">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${activityCategoryDotClasses[category]}`}
              />
              {activityCategoryLabels[category]}
            </li>
          ))}
        </ul>
      )}

      <table className="sr-only">
        <caption>Charge hebdomadaire par catégorie, 12 dernières semaines</caption>
        <thead>
          <tr>
            <th scope="col">Semaine</th>
            {categoriesPresent.map((c) => (
              <th scope="col" key={c}>
                {activityCategoryLabels[c]}
              </th>
            ))}
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.weekKey}>
              <th scope="row">{weekShortLabel(week.weekKey)}</th>
              {categoriesPresent.map((c) => (
                <td key={c}>{Math.round(week.byCategory[c] ?? 0)}</td>
              ))}
              <td>{Math.round(week.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
