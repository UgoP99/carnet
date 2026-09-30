import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeSession } from '@/test/factories';
import {
  archiveActivity,
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from './activityRepo';
import { db } from './db';
import { InvariantError } from './errors';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createActivity', () => {
  it('assigns id and timestamps', async () => {
    const activity = await createActivity({
      name: 'Judo',
      category: 'grappling',
      color: 'sky',
      order: 7,
    });
    expect(activity.id).toBeTruthy();
    expect(activity.archived).toBe(false);
    expect(await db.activities.get(activity.id)).toEqual(activity);
  });

  it('rejects an invalid category', async () => {
    await expect(
      // @ts-expect-error intentionally invalid input
      createActivity({ name: 'Judo', category: 'invalid', color: 'sky', order: 7 }),
    ).rejects.toThrow();
  });
});

describe('updateActivity', () => {
  it('merges the patch and bumps updatedAt', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const activity = await createActivity({
      name: 'Judo',
      category: 'grappling',
      color: 'sky',
      order: 7,
    });
    vi.setSystemTime(new Date('2026-01-02T00:00:00.000Z'));
    const updated = await updateActivity(activity.id, { name: 'Judo/JJB' });
    expect(updated.name).toBe('Judo/JJB');
    expect(updated.category).toBe('grappling');
    expect(updated.createdAt).toBe(activity.createdAt);
    expect(updated.updatedAt).not.toBe(activity.updatedAt);
  });
});

describe('deleteActivity', () => {
  it('hard-deletes an unreferenced activity', async () => {
    const activity = await createActivity({
      name: 'Judo',
      category: 'grappling',
      color: 'sky',
      order: 7,
    });
    await deleteActivity(activity.id);
    expect(await db.activities.get(activity.id)).toBeUndefined();
  });

  it('refuses to delete an activity referenced by a session (invariant 4)', async () => {
    const activity = await createActivity({
      name: 'Judo',
      category: 'grappling',
      color: 'sky',
      order: 7,
    });
    await db.sessions.add(makeSession({ activityId: activity.id }));

    await expect(deleteActivity(activity.id)).rejects.toThrow(InvariantError);
    expect(await db.activities.get(activity.id)).toBeDefined();
  });

  it('allows archiving a referenced activity instead', async () => {
    const activity = await createActivity({
      name: 'Judo',
      category: 'grappling',
      color: 'sky',
      order: 7,
    });
    await db.sessions.add(makeSession({ activityId: activity.id }));

    const archived = await archiveActivity(activity.id);
    expect(archived.archived).toBe(true);
  });
});

describe('listActivities', () => {
  it('orders by the order field', async () => {
    await createActivity({ name: 'Z', category: 'other', color: 'slate', order: 0 });
    const activities = await listActivities();
    const orders = activities.map((a) => a.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(activities[0]?.name).toBe('Z');
  });
});
