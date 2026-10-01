import { BarChart3 } from 'lucide-react';
import { useSearchParams } from 'react-router';
import {
  useActivities,
  useExerciseEntriesForExercise,
  useExercises,
  useSessions,
} from '@/db/hooks';
import { dailyLoads, minutesByActivity, weeklyLoadByCategory } from '@/domain/load';
import { e1rmProgression } from '@/domain/strength';
import {
  addWeeks,
  isoWeekKey,
  monthKey,
  monthRange,
  recentWeeks,
  todayLocal,
  weekRange,
  type MonthKey,
} from '@/lib/dates';
import { EmptyState } from '@/ui/EmptyState';
import { ActivityMinutesChart } from './ActivityMinutesChart';
import { CalendarHeatmap } from './CalendarHeatmap';
import { ExerciseProgress } from './ExerciseProgress';
import { LoadChart } from './LoadChart';

const WEEKS_WINDOW = 12;

export function StatsView() {
  const sessions = useSessions();
  const activities = useActivities();
  const exercises = useExercises();
  const [searchParams, setSearchParams] = useSearchParams();

  const month: MonthKey = searchParams.get('m') ?? monthKey(todayLocal());
  const exerciseId = searchParams.get('ex') ?? undefined;
  const entries = useExerciseEntriesForExercise(exerciseId);

  function goToMonth(next: MonthKey) {
    const params = new URLSearchParams(searchParams);
    if (next === monthKey(todayLocal())) {
      params.delete('m');
    } else {
      params.set('m', next);
    }
    setSearchParams(params);
  }

  function selectExercise(id: string | undefined) {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set('ex', id);
    } else {
      params.delete('ex');
    }
    setSearchParams(params);
  }

  if (sessions === undefined || activities === undefined || exercises === undefined) return null;

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-20">
        <h1 className="text-xl font-semibold">Stats</h1>
        <EmptyState
          icon={BarChart3}
          title="Pas encore de stats"
          description="Logue quelques séances pour voir tes tendances ici."
        />
      </div>
    );
  }

  const currentWeek = isoWeekKey(todayLocal());
  const weeks = recentWeeks(currentWeek, WEEKS_WINDOW);
  const windowStart = weekRange(addWeeks(currentWeek, -(WEEKS_WINDOW - 1))).start;
  const windowEnd = weekRange(currentWeek).end;
  const windowSessions = sessions.filter((s) => s.date >= windowStart && s.date <= windowEnd);
  const loadByCategory = weeklyLoadByCategory(sessions, activities, weeks);
  const minutesData = minutesByActivity(windowSessions, activities);

  const { start: monthStart, end: monthEnd } = monthRange(month);
  const monthSessions = sessions.filter((s) => s.date >= monthStart && s.date <= monthEnd);
  const dailyLoad = dailyLoads(monthSessions);

  const progressionPoints = e1rmProgression(entries ?? []);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <h1 className="text-xl font-semibold">Stats</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Charge par catégorie (12 sem.)
        </h2>
        <LoadChart weeks={loadByCategory} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Minutes par activité (12 sem.)
        </h2>
        <ActivityMinutesChart data={minutesData} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Calendrier de charge
        </h2>
        <CalendarHeatmap month={month} dailyLoad={dailyLoad} onChange={goToMonth} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Progression (e1RM)</h2>
        <ExerciseProgress
          exercises={exercises}
          selectedId={exerciseId}
          onSelect={selectExercise}
          points={progressionPoints}
        />
      </section>
    </div>
  );
}
