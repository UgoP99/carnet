import { eachDayOfInterval, format, getISODay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, monthKey, monthRange, todayLocal, type MonthKey } from '@/lib/dates';

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const numberFormat = new Intl.NumberFormat('fr-BE', { maximumFractionDigits: 0 });

function monthLabel(month: MonthKey): string {
  const label = format(parseISO(`${month}-01`), 'LLLL yyyy', { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function intensityClass(ratio: number): string {
  if (ratio <= 0) return 'bg-slate-100 dark:bg-slate-900';
  if (ratio < 0.25) return 'bg-sky-200 dark:bg-sky-900';
  if (ratio < 0.5) return 'bg-sky-400 dark:bg-sky-800';
  if (ratio < 0.75) return 'bg-sky-600 dark:bg-sky-600';
  return 'bg-sky-800 dark:bg-sky-400';
}

/** Month grid heatmap of daily load, Monday-first. */
export function CalendarHeatmap({
  month,
  dailyLoad,
  onChange,
}: {
  month: MonthKey;
  dailyLoad: Record<string, number>;
  onChange: (month: MonthKey) => void;
}) {
  const { start, end } = monthRange(month);
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });
  const leadingBlanks = getISODay(parseISO(start)) - 1; // Monday = 1 .. Sunday = 7
  const maxLoad = Math.max(1, ...Object.values(dailyLoad));
  const isCurrentMonth = month === monthKey(todayLocal());

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => {
            onChange(addMonths(month, -1));
          }}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {monthLabel(month)}
          </span>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => {
                onChange(monthKey(todayLocal()));
              }}
              className="text-xs font-medium text-sky-600 dark:text-sky-400"
            >
              Ce mois-ci
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => {
            onChange(addMonths(month, 1));
          }}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div
        role="table"
        aria-label={`Charge quotidienne, ${monthLabel(month)}`}
        className="flex flex-col gap-1"
      >
        <div role="row" className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <span
              key={i}
              role="columnheader"
              className="text-center text-[10px] text-slate-500 dark:text-slate-400"
            >
              {label}
            </span>
          ))}
        </div>
        <div role="row" className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <span key={`blank-${i}`} aria-hidden="true" />
          ))}
          {days.map((day) => {
            const date = format(day, 'yyyy-MM-dd');
            const load = dailyLoad[date] ?? 0;
            return (
              <div
                key={date}
                role="cell"
                aria-label={`${format(day, 'd MMMM', { locale: fr })} : charge ${numberFormat.format(load)}`}
                title={`${format(day, 'd MMM', { locale: fr })} : ${numberFormat.format(load)}`}
                className={`aspect-square rounded ${intensityClass(load / maxLoad)}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
