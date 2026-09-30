import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeActivity } from '@/test/factories';
import { newId } from '@/lib/id';
import { db } from './db';
import { InvariantError } from './errors';
import { createExerciseEntry } from './exerciseEntryRepo';
import { createTechniqueLog } from './techniqueLogRepo';
import { createSession, deleteSession, getSession, updateSession } from './sessionRepo';

beforeEach(async () => {
  await db.delete();
  await db.open();
  vi.useRealTimers();
});

async function makeStrengthActivity() {
  const activity = makeActivity({ category: 'strength' });
  await db.activities.add(activity);
  return activity;
}

async function makeGrapplingActivity() {
  const activity = makeActivity({ category: 'grappling' });
  await db.activities.add(activity);
  return activity;
}

describe('createSession — invariant 1', () => {
  it('accepts a grappling block on a grappling activity', async () => {
    const activity = await makeGrapplingActivity();
    const session = await createSession({
      date: '2026-09-28',
      activityId: activity.id,
      durationMin: 60,
      rpe: 6,
      pains: [],
      grappling: { content: ['sparring'], partners: [] },
    });
    expect(session.grappling?.content).toEqual(['sparring']);
  });

  it('rejects a grappling block on a non-grappling activity', async () => {
    const activity = await makeStrengthActivity();
    await expect(
      createSession({
        date: '2026-09-28',
        activityId: activity.id,
        durationMin: 60,
        rpe: 6,
        pains: [],
        grappling: { content: [], partners: [] },
      }),
    ).rejects.toThrow(InvariantError);
  });

  it('accepts a strength session with no grappling block', async () => {
    const activity = await makeStrengthActivity();
    const session = await createSession({
      date: '2026-09-28',
      activityId: activity.id,
      durationMin: 45,
      rpe: 5,
      pains: [],
    });
    expect(session.grappling).toBeUndefined();
  });
});

describe('updateSession — invariant 7', () => {
  it('bumps updatedAt on every write', async () => {
    const activity = await makeStrengthActivity();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const session = await createSession({
      date: '2026-09-28',
      activityId: activity.id,
      durationMin: 45,
      rpe: 5,
      pains: [],
    });
    vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));
    const updated = await updateSession(session.id, { rpe: 7 });
    expect(updated.updatedAt).not.toBe(session.updatedAt);
    vi.useRealTimers();
  });
});

describe('updateSession — invariant 3 (date cascade)', () => {
  it('cascades a date change to ExerciseEntries and TechniqueLogs, same transaction', async () => {
    const activity = await makeStrengthActivity();
    const session = await createSession({
      date: '2026-09-28',
      activityId: activity.id,
      durationMin: 45,
      rpe: 5,
      pains: [],
    });
    const entry = await createExerciseEntry({
      sessionId: session.id,
      exerciseId: newId(),
      date: session.date,
      order: 0,
      sets: [{ reps: 5, weightKg: 100, warmup: false }],
    });
    const log = await createTechniqueLog({
      techniqueId: newId(),
      sessionId: session.id,
      date: session.date,
    });

    await updateSession(session.id, { date: '2026-10-01' });

    expect((await db.exerciseEntries.get(entry.id))?.date).toBe('2026-10-01');
    expect((await db.techniqueLogs.get(log.id))?.date).toBe('2026-10-01');
  });

  it('does not touch related rows when the date is unchanged', async () => {
    const activity = await makeStrengthActivity();
    const session = await createSession({
      date: '2026-09-28',
      activityId: activity.id,
      durationMin: 45,
      rpe: 5,
      pains: [],
    });
    const entry = await createExerciseEntry({
      sessionId: session.id,
      exerciseId: newId(),
      date: session.date,
      order: 0,
      sets: [{ reps: 5, weightKg: 100, warmup: false }],
    });

    await updateSession(session.id, { rpe: 8 });

    expect((await db.exerciseEntries.get(entry.id))?.date).toBe('2026-09-28');
  });
});

describe('deleteSession — invariant 2', () => {
  it('deletes ExerciseEntries and detaches TechniqueLogs (keeps text)', async () => {
    const activity = await makeStrengthActivity();
    const session = await createSession({
      date: '2026-09-28',
      activityId: activity.id,
      durationMin: 45,
      rpe: 5,
      pains: [],
    });
    const entry = await createExerciseEntry({
      sessionId: session.id,
      exerciseId: newId(),
      date: session.date,
      order: 0,
      sets: [{ reps: 5, weightKg: 100, warmup: false }],
    });
    const log = await createTechniqueLog({
      techniqueId: newId(),
      sessionId: session.id,
      date: session.date,
      text: 'Key detail',
    });

    await deleteSession(session.id);

    expect(await getSession(session.id)).toBeUndefined();
    expect(await db.exerciseEntries.get(entry.id)).toBeUndefined();
    const detached = await db.techniqueLogs.get(log.id);
    expect(detached?.sessionId).toBeUndefined();
    expect(detached?.text).toBe('Key detail');
  });
});
