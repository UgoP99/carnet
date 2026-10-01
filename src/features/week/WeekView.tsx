import { BarChart3, Calendar, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useActivities, useSessions, useSettings } from '@/db/hooks';
import { activityColorClasses } from '@/domain/labels';
import { loadForWeek, trend, weeklyTotals } from '@/domain/load';
import { addWeeks, isoWeekKey, todayLocal, weekRange, type WeekKey } from '@/lib/dates';
import { EmptyState } from '@/ui/EmptyState';
import { BackupReminderBanner } from '../settings/BackupReminderBanner';
import { DayStrip } from './DayStrip';
import { GoalBar } from './GoalBar';
import { SelectedDaySessions } from './SelectedDaySessions';
import { WeekNav } from './WeekNav';
import { WeekTotals } from './WeekTotals';

export function WeekView() {
  const sessions = useSessions();
  const activities = useActivities();
  const settings = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<string>();

  const weekKey: WeekKey = searchParams.get('w') ?? isoWeekKey(todayLocal());

  function goToWeek(next: WeekKey) {
    setSelectedDay(undefined);
    setSearchParams(next === isoWeekKey(todayLocal()) ? {} : { w: next });
  }

  const activityColorById = useMemo(
    () => new Map((activities ?? []).map((a) => [a.id, activityColorClasses[a.color]])),
    [activities],
  );

  const { start, end } = weekRange(weekKey);
  const weekSessions = useMemo(
    () => (sessions ?? []).filter((s) => s.date >= start && s.date <= end),
    [sessions, start, end],
  );
  const totals = useMemo(
    () => weeklyTotals(weekSessions, activities ?? []),
    [weekSessions, activities],
  );
  const trendValue = useMemo(() => {
    if (!sessions) return null;
    const previousLoads = [1, 2, 3, 4].map((n) => loadForWeek(sessions, addWeeks(weekKey, -n)));
    return trend(totals.load, previousLoads);
  }, [sessions, weekKey, totals.load]);

  if (sessions === undefined || activities === undefined || settings === undefined) return null;

  const activityById = new Map(activities.map((a) => [a.id, a]));
  const hasGoals =
    settings.goals.weeklyMinutes !== undefined || settings.goals.perActivity.length > 0;
  const selectedDaySessions = selectedDay ? weekSessions.filter((s) => s.date === selectedDay) : [];

  return (
    <div className="flex flex-col gap-4 pb-20">
      <BackupReminderBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Semaine</h1>
        <Link
          to="/stats"
          className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950"
        >
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Stats
        </Link>
      </div>

      <WeekNav weekKey={weekKey} onChange={goToWeek} />

      {weekSessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucune séance cette semaine"
          description="Ajoute ta séance avec le bouton +."
        />
      ) : (
        <>
          <DayStrip
            weekKey={weekKey}
            sessions={weekSessions}
            activityColorById={activityColorById}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
          {selectedDay && (
            <SelectedDaySessions
              sessions={selectedDaySessions}
              activityById={activityById}
              activityColorById={activityColorById}
            />
          )}
          <WeekTotals totals={totals} trendValue={trendValue} activities={activities} />
        </>
      )}

      {hasGoals && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Objectifs</h2>
          {settings.goals.weeklyMinutes !== undefined && (
            <GoalBar
              label="Minutes cette semaine"
              value={totals.minutes}
              target={settings.goals.weeklyMinutes}
            />
          )}
          {settings.goals.perActivity.map((goal) => {
            const activity = activityById.get(goal.activityId);
            if (!activity) return null;
            return (
              <GoalBar
                key={goal.activityId}
                label={activity.name}
                value={totals.byActivity[goal.activityId]?.sessions ?? 0}
                target={goal.sessionsPerWeek}
              />
            );
          })}
        </div>
      )}

      <Link
        to="/sessions/new"
        aria-label="Nouvelle séance"
        className="fixed bottom-[max(calc(env(safe-area-inset-bottom)+4.5rem),5rem)] right-4 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-500"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </Link>
    </div>
  );
}
