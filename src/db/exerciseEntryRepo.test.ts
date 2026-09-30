import { beforeEach, describe, expect, it } from 'vitest';
import { makeActivity, makeSession } from '@/test/factories';
import { newId } from '@/lib/id';
import { db } from './db';
import { InvariantError } from './errors';
import {
  createExerciseEntry,
  deleteExerciseEntry,
  getLastEntry,
  listEntriesForSession,
  updateExerciseEntry,
} from './exerciseEntryRepo';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

async function makeStrengthSession() {
  const activity = makeActivity({ category: 'strength' });
  await db.activities.add(activity);
  const session = makeSession({ activityId: activity.id });
  await db.sessions.add(session);
  return session;
}

async function makeGrapplingSession() {
  const activity = makeActivity({ category: 'grappling' });
  await db.activities.add(activity);
  const session = makeSession({ activityId: activity.id });
  await db.sessions.add(session);
  return session;
}

describe('createExerciseEntry', () => {
  it('creates an entry for a strength session', async () => {
    const session = await makeStrengthSession();
    const exerciseId = newId();
    const entry = await createExerciseEntry({
      sessionId: session.id,
      exerciseId,
      date: session.date,
      order: 0,
      sets: [{ reps: 5, weightKg: 100, warmup: false }],
    });
    expect(entry.id).toBeTruthy();
  });

  it('refuses an entry for a non-strength session (invariant 1)', async () => {
    const session = await makeGrapplingSession();
    await expect(
      createExerciseEntry({
        sessionId: session.id,
        exerciseId: newId(),
        date: session.date,
        order: 0,
        sets: [{ reps: 5, weightKg: 100, warmup: false }],
      }),
    ).rejects.toThrow(InvariantError);
  });
});

describe('listEntriesForSession', () => {
  it('returns entries sorted by order', async () => {
    const session = await makeStrengthSession();
    const exerciseId = newId();
    await createExerciseEntry({
      sessionId: session.id,
      exerciseId,
      date: session.date,
      order: 1,
      sets: [{ reps: 5, weightKg: 100, warmup: false }],
    });
    await createExerciseEntry({
      sessionId: session.id,
      exerciseId,
      date: session.date,
      order: 0,
      sets: [{ reps: 5, weightKg: 80, warmup: false }],
    });

    const entries = await listEntriesForSession(session.id);
    expect(entries.map((e) => e.order)).toEqual([0, 1]);
  });
});

describe('getLastEntry', () => {
  it('returns the most recent entry excluding the current session', async () => {
    const session1 = await makeStrengthSession();
    const session2 = await makeStrengthSession();
    const exerciseId = newId();

    const older = await createExerciseEntry({
      sessionId: session1.id,
      exerciseId,
      date: '2026-09-20',
      order: 0,
      sets: [{ reps: 5, weightKg: 90, warmup: false }],
    });
    const current = await createExerciseEntry({
      sessionId: session2.id,
      exerciseId,
      date: '2026-09-28',
      order: 0,
      sets: [{ reps: 5, weightKg: 100, warmup: false }],
    });

    expect(await getLastEntry(exerciseId, session2.id)).toEqual(older);
    expect(await getLastEntry(exerciseId)).toEqual(current);
  });

  it('returns undefined when no prior entry exists', async () => {
    expect(await getLastEntry(newId())).toBeUndefined();
  });
});

describe('updateExerciseEntry / deleteExerciseEntry', () => {
  it('updates sets and preserves sessionId/exerciseId', async () => {
    const session = await makeStrengthSession();
    const exerciseId = newId();
    const entry = await createExerciseEntry({
      sessionId: session.id,
      exerciseId,
      date: session.date,
      order: 0,
      sets: [{ reps: 5, weightKg: 100, warmup: false }],
    });

    const updated = await updateExerciseEntry(entry.id, {
      sets: [{ reps: 3, weightKg: 110, warmup: false }],
    });
    expect(updated.sets[0]?.weightKg).toBe(110);
    expect(updated.sessionId).toBe(session.id);

    await deleteExerciseEntry(entry.id);
    expect(await listEntriesForSession(session.id)).toHaveLength(0);
  });
});
