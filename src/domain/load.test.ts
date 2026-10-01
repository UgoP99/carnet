import { describe, expect, it } from 'vitest';
import {
  dailyLoads,
  loadForWeek,
  minutesByActivity,
  sessionLoad,
  trend,
  weeklyLoadByCategory,
  weeklyTotals,
} from './load';
import type { Activity, Session } from './schemas';

const ts = new Date().toISOString();

function activity(overrides: Partial<Activity>): Activity {
  return {
    id: 'act-1',
    name: 'JJB',
    category: 'grappling',
    color: 'violet',
    order: 1,
    archived: false,
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

function session(overrides: Partial<Session>): Session {
  return {
    id: 's1',
    date: '2026-09-28',
    activityId: 'act-1',
    durationMin: 60,
    rpe: 5,
    pains: [],
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

describe('sessionLoad', () => {
  it('multiplies duration by RPE', () => {
    expect(sessionLoad({ durationMin: 60, rpe: 6 })).toBe(360);
  });
});

describe('weeklyTotals', () => {
  it('sums sessions, minutes and load overall, by activity and by category', () => {
    const grappling = activity({ id: 'act-1', category: 'grappling' });
    const strength = activity({ id: 'act-2', category: 'strength' });
    const sessions = [
      session({ id: 's1', activityId: 'act-1', durationMin: 60, rpe: 5 }),
      session({ id: 's2', activityId: 'act-1', durationMin: 30, rpe: 7 }),
      session({ id: 's3', activityId: 'act-2', durationMin: 45, rpe: 6 }),
    ];

    const totals = weeklyTotals(sessions, [grappling, strength]);

    expect(totals).toMatchObject({
      sessions: 3,
      minutes: 135,
      load: 60 * 5 + 30 * 7 + 45 * 6,
    });
    expect(totals.byActivity['act-1']).toEqual({ sessions: 2, minutes: 90, load: 510 });
    expect(totals.byActivity['act-2']).toEqual({ sessions: 1, minutes: 45, load: 270 });
    expect(totals.byCategory.grappling).toEqual({ sessions: 2, minutes: 90, load: 510 });
    expect(totals.byCategory.strength).toEqual({ sessions: 1, minutes: 45, load: 270 });
  });

  it('returns zeroed totals for an empty week', () => {
    const totals = weeklyTotals([], []);
    expect(totals).toMatchObject({ sessions: 0, minutes: 0, load: 0 });
  });

  it('ignores sessions referencing an unknown activity for byCategory', () => {
    const totals = weeklyTotals([session({ activityId: 'missing' })], []);
    expect(totals.sessions).toBe(1);
    expect(totals.byCategory).toEqual({});
  });
});

describe('loadForWeek', () => {
  it('sums load for sessions within the ISO week, Monday to Sunday', () => {
    const sessions = [
      session({ id: 's1', date: '2026-09-28', durationMin: 60, rpe: 5 }), // Mon W40
      session({ id: 's2', date: '2026-10-04', durationMin: 30, rpe: 7 }), // Sun W40
      session({ id: 's3', date: '2026-10-05', durationMin: 45, rpe: 6 }), // Mon W41 — excluded
    ];
    expect(loadForWeek(sessions, '2026-W40')).toBe(60 * 5 + 30 * 7);
  });

  it('returns 0 for a week with no sessions', () => {
    expect(loadForWeek([], '2026-W40')).toBe(0);
  });
});

describe('trend', () => {
  it('returns null with fewer than 2 weeks of history', () => {
    expect(trend(100, [0, 0, 50, 0])).toBeNull();
  });

  it('returns null with no previous weeks', () => {
    expect(trend(100, [])).toBeNull();
  });

  it('computes current load over mean of previous weeks', () => {
    expect(trend(200, [100, 100, 100, 100])).toBe(2);
  });

  it('divides by the mean including zero weeks', () => {
    expect(trend(100, [100, 100, 0, 0])).toBe(2);
  });
});

describe('weeklyLoadByCategory', () => {
  it('breaks load down by category for each requested week', () => {
    const grappling = activity({ id: 'act-1', category: 'grappling' });
    const strength = activity({ id: 'act-2', category: 'strength' });
    const sessions = [
      session({ id: 's1', activityId: 'act-1', date: '2026-09-28', durationMin: 60, rpe: 5 }), // W40
      session({ id: 's2', activityId: 'act-2', date: '2026-10-05', durationMin: 30, rpe: 6 }), // W41
    ];

    const result = weeklyLoadByCategory(sessions, [grappling, strength], ['2026-W40', '2026-W41']);

    expect(result).toEqual([
      { weekKey: '2026-W40', byCategory: { grappling: 300 }, total: 300 },
      { weekKey: '2026-W41', byCategory: { strength: 180 }, total: 180 },
    ]);
  });

  it('returns zeroed entries for weeks with no sessions', () => {
    expect(weeklyLoadByCategory([], [], ['2026-W40'])).toEqual([
      { weekKey: '2026-W40', byCategory: {}, total: 0 },
    ]);
  });

  it('spans an ISO year boundary week', () => {
    const grappling = activity({ id: 'act-1', category: 'grappling' });
    const sessions = [
      session({ id: 's1', activityId: 'act-1', date: '2027-01-01', durationMin: 60, rpe: 5 }), // 2026-W53
    ];
    expect(weeklyLoadByCategory(sessions, [grappling], ['2026-W53'])).toEqual([
      { weekKey: '2026-W53', byCategory: { grappling: 300 }, total: 300 },
    ]);
  });
});

describe('minutesByActivity', () => {
  it('sums minutes per activity, sorted descending', () => {
    const grappling = activity({ id: 'act-1', name: 'JJB' });
    const strength = activity({ id: 'act-2', name: 'Muscu' });
    const sessions = [
      session({ activityId: 'act-1', durationMin: 30 }),
      session({ activityId: 'act-1', durationMin: 30 }),
      session({ activityId: 'act-2', durationMin: 90 }),
    ];

    expect(minutesByActivity(sessions, [grappling, strength])).toEqual([
      { activity: strength, minutes: 90 },
      { activity: grappling, minutes: 60 },
    ]);
  });

  it('omits activities with no sessions', () => {
    const grappling = activity({ id: 'act-1' });
    expect(minutesByActivity([], [grappling])).toEqual([]);
  });
});

describe('dailyLoads', () => {
  it('sums load per calendar day', () => {
    const sessions = [
      session({ date: '2026-09-28', durationMin: 60, rpe: 5 }),
      session({ date: '2026-09-28', durationMin: 30, rpe: 4 }),
      session({ date: '2026-09-29', durationMin: 20, rpe: 6 }),
    ];
    expect(dailyLoads(sessions)).toEqual({
      '2026-09-28': 60 * 5 + 30 * 4,
      '2026-09-29': 20 * 6,
    });
  });

  it('returns an empty object for no sessions', () => {
    expect(dailyLoads([])).toEqual({});
  });
});
