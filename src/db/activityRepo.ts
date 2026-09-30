import { newId } from '@/lib/id';
import { activitySchema, type Activity } from '@/domain/schemas';
import { db } from './db';
import { InvariantError } from './errors';

export type CreateActivityInput = Omit<Activity, 'id' | 'archived' | 'createdAt' | 'updatedAt'>;
export type UpdateActivityInput = Partial<Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>>;

export async function listActivities(): Promise<Activity[]> {
  return db.activities.orderBy('order').toArray();
}

export async function getActivity(id: string): Promise<Activity | undefined> {
  return db.activities.get(id);
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const now = new Date().toISOString();
  const activity = activitySchema.parse({
    ...input,
    id: newId(),
    archived: false,
    createdAt: now,
    updatedAt: now,
  });
  await db.activities.add(activity);
  return activity;
}

export async function updateActivity(id: string, patch: UpdateActivityInput): Promise<Activity> {
  const existing = await db.activities.get(id);
  if (!existing) throw new InvariantError(`Activité introuvable : ${id}`);
  const updated = activitySchema.parse({
    ...existing,
    ...patch,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await db.activities.put(updated);
  return updated;
}

/** Archives an activity, referenced or not. Hidden from pickers but kept where referenced. */
export async function archiveActivity(id: string): Promise<Activity> {
  return updateActivity(id, { archived: true });
}

/** Hard-deletes an activity — only allowed when no session references it (invariant 4). */
export async function deleteActivity(id: string): Promise<void> {
  const referenced = await db.sessions.where('activityId').equals(id).count();
  if (referenced > 0) {
    throw new InvariantError('Activité utilisée par des séances : archive-la plutôt.');
  }
  await db.activities.delete(id);
}
