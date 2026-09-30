import { describe, expect, it } from 'vitest';
import { makeActivity, makeSession } from '@/test/factories';
import { mostUsedActivities } from './activityUsage';

describe('mostUsedActivities', () => {
  it('orders activities by session count, most-used first', () => {
    const jjb = makeActivity({ id: 'jjb', order: 2 });
    const lifting = makeActivity({ id: 'lifting', order: 1 });
    const sessions = [
      makeSession({ activityId: 'lifting' }),
      makeSession({ activityId: 'jjb' }),
      makeSession({ activityId: 'jjb' }),
    ];

    expect(mostUsedActivities([jjb, lifting], sessions, 2)).toEqual([jjb, lifting]);
  });

  it('falls back to order when unused, and excludes archived activities', () => {
    const unused = makeActivity({ id: 'a', order: 1 });
    const alsoUnused = makeActivity({ id: 'b', order: 2 });
    const archived = makeActivity({ id: 'c', order: 0, archived: true });

    const result = mostUsedActivities([alsoUnused, archived, unused], [], 10);

    expect(result).toEqual([unused, alsoUnused]);
  });

  it('truncates to n', () => {
    const activities = [makeActivity({ id: 'a' }), makeActivity({ id: 'b' })];
    expect(mostUsedActivities(activities, [], 1)).toHaveLength(1);
  });
});
