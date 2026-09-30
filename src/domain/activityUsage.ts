import type { Activity, Session } from './schemas';

/** Non-archived activities ordered by how often they're used in `sessions`, most-used first. */
export function mostUsedActivities(
  activities: Activity[],
  sessions: Session[],
  n: number,
): Activity[] {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    counts.set(session.activityId, (counts.get(session.activityId) ?? 0) + 1);
  }
  return activities
    .filter((a) => !a.archived)
    .toSorted((a, b) => {
      const diff = (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0);
      return diff !== 0 ? diff : a.order - b.order;
    })
    .slice(0, n);
}
