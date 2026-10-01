import { weekRange, type LocalDate, type WeekKey } from '@/lib/dates';
import type { ActivityCategory } from './labels';
import type { Activity, Session } from './schemas';

/** Session load in arbitrary units (UA) = duration × RPE. */
export function sessionLoad(session: Pick<Session, 'durationMin' | 'rpe'>): number {
  return session.durationMin * session.rpe;
}

export interface Totals {
  sessions: number;
  minutes: number;
  load: number;
}

export interface WeeklyTotals extends Totals {
  byActivity: Record<string, Totals>;
  byCategory: Partial<Record<ActivityCategory, Totals>>;
}

function emptyTotals(): Totals {
  return { sessions: 0, minutes: 0, load: 0 };
}

function addSession(totals: Totals, session: Session): void {
  totals.sessions += 1;
  totals.minutes += session.durationMin;
  totals.load += sessionLoad(session);
}

/** Aggregates a set of sessions (typically one week) by activity and by category. */
export function weeklyTotals(sessions: Session[], activities: Activity[]): WeeklyTotals {
  const activityById = new Map(activities.map((a) => [a.id, a]));
  const totals: WeeklyTotals = { ...emptyTotals(), byActivity: {}, byCategory: {} };

  for (const session of sessions) {
    addSession(totals, session);

    const byActivity = (totals.byActivity[session.activityId] ??= emptyTotals());
    addSession(byActivity, session);

    const category = activityById.get(session.activityId)?.category;
    if (category) {
      const byCategory = (totals.byCategory[category] ??= emptyTotals());
      addSession(byCategory, session);
    }
  }

  return totals;
}

/** Total load of the sessions falling within the given ISO week. */
export function loadForWeek(sessions: Session[], weekKey: WeekKey): number {
  const { start, end } = weekRange(weekKey);
  return sessions
    .filter((session) => session.date >= start && session.date <= end)
    .reduce((sum, session) => sum + sessionLoad(session), 0);
}

/**
 * Ratio of this week's load to the mean load of the previous weeks (typically the last 4).
 * Null when fewer than 2 of those weeks have any load — not enough history for a meaningful trend.
 * No injury-risk interpretation is attached (see docs/DOMAIN.md).
 */
export function trend(currentLoad: number, previousWeeksLoads: number[]): number | null {
  const weeksWithLoad = previousWeeksLoads.filter((load) => load > 0).length;
  if (weeksWithLoad < 2 || previousWeeksLoads.length === 0) return null;
  const mean = previousWeeksLoads.reduce((sum, load) => sum + load, 0) / previousWeeksLoads.length;
  if (mean === 0) return null;
  return currentLoad / mean;
}

export interface WeekCategoryLoad {
  weekKey: WeekKey;
  byCategory: Partial<Record<ActivityCategory, number>>;
  total: number;
}

/** Load broken down by category, for each of the given weeks (e.g. the last 12). */
export function weeklyLoadByCategory(
  sessions: Session[],
  activities: Activity[],
  weekKeys: WeekKey[],
): WeekCategoryLoad[] {
  const activityById = new Map(activities.map((a) => [a.id, a]));

  return weekKeys.map((weekKey) => {
    const { start, end } = weekRange(weekKey);
    const byCategory: Partial<Record<ActivityCategory, number>> = {};
    let total = 0;

    for (const session of sessions) {
      if (session.date < start || session.date > end) continue;
      const category = activityById.get(session.activityId)?.category;
      const load = sessionLoad(session);
      total += load;
      if (category) byCategory[category] = (byCategory[category] ?? 0) + load;
    }

    return { weekKey, byCategory, total };
  });
}

export interface ActivityMinutes {
  activity: Activity;
  minutes: number;
}

/** Total minutes per activity across the given sessions, sorted by minutes descending. */
export function minutesByActivity(sessions: Session[], activities: Activity[]): ActivityMinutes[] {
  const minutesById = new Map<string, number>();
  for (const session of sessions) {
    minutesById.set(
      session.activityId,
      (minutesById.get(session.activityId) ?? 0) + session.durationMin,
    );
  }

  return activities
    .map((activity) => ({ activity, minutes: minutesById.get(activity.id) ?? 0 }))
    .filter((entry) => entry.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}

/** Total load per calendar day, for the given sessions. */
export function dailyLoads(sessions: Session[]): Record<LocalDate, number> {
  const result: Record<LocalDate, number> = {};
  for (const session of sessions) {
    result[session.date] = (result[session.date] ?? 0) + sessionLoad(session);
  }
  return result;
}
