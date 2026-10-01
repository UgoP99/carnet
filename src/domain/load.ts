import { weekRange, type WeekKey } from '@/lib/dates';
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
