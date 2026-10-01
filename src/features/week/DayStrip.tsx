import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Session } from '@/domain/schemas';
import { weekRange, type WeekKey } from '@/lib/dates';

export function DayStrip({
  weekKey,
  sessions,
  activityColorById,
  selectedDay,
  onSelectDay,
}: {
  weekKey: WeekKey;
  sessions: Session[];
  activityColorById: Map<string, string>;
  selectedDay: string | undefined;
  onSelectDay: (day: string | undefined) => void;
}) {
  const { start, end } = weekRange(weekKey);
  const days = eachDayOfInterval({ start: parseISO(start), end: parseISO(end) });

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const daySessions = sessions.filter((s) => s.date === dayKey);
        const selected = selectedDay === dayKey;
        return (
          <button
            key={dayKey}
            type="button"
            disabled={daySessions.length === 0}
            onClick={() => {
              onSelectDay(selected ? undefined : dayKey);
            }}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium disabled:opacity-40 ${
              selected
                ? 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>{format(day, 'EEEEE', { locale: fr })}</span>
            <span className="flex gap-0.5">
              {daySessions.length === 0 ? (
                <span className="h-1.5 w-1.5" />
              ) : (
                daySessions.map((s) => (
                  <span
                    key={s.id}
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${activityColorById.get(s.activityId) ?? 'bg-slate-400'}`}
                  />
                ))
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
