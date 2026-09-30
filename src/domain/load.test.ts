import { describe, expect, it } from 'vitest';
import { sessionLoad, trend, weeklyTotals } from './load';
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
