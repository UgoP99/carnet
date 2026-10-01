import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addWeeks, isoWeekKey, todayLocal, weekRange, type WeekKey } from '@/lib/dates';

export function weekLabel(weekKey: WeekKey): string {
  const { start, end } = weekRange(weekKey);
  return `Semaine du ${format(parseISO(start), 'd MMM', { locale: fr })} au ${format(parseISO(end), 'd MMM', { locale: fr })}`;
}

export function WeekNav({
  weekKey,
  onChange,
}: {
  weekKey: WeekKey;
  onChange: (weekKey: WeekKey) => void;
}) {
  const isCurrentWeek = weekKey === isoWeekKey(todayLocal());
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        aria-label="Semaine précédente"
        onClick={() => {
          onChange(addWeeks(weekKey, -1));
        }}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {weekLabel(weekKey)}
        </span>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={() => {
              onChange(isoWeekKey(todayLocal()));
            }}
            className="text-xs font-medium text-sky-600 dark:text-sky-400"
          >
            Aujourd'hui
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Semaine suivante"
        onClick={() => {
          onChange(addWeeks(weekKey, 1));
        }}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
