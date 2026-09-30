import { newId } from '@/lib/id';
import { sessionSchema, type Session } from '@/domain/schemas';
import { db } from './db';
import { InvariantError } from './errors';

export type CreateSessionInput = Omit<Session, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSessionInput = Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt'>>;

export async function getSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id);
}

export async function listSessions(): Promise<Session[]> {
  return db.sessions.orderBy('date').reverse().toArray();
}

/** Invariant 1: a grappling block requires a grappling activity. */
async function assertGrapplingConsistency(
  activityId: string,
  hasGrappling: boolean,
): Promise<void> {
  if (!hasGrappling) return;
  const activity = await db.activities.get(activityId);
  if (activity?.category !== 'grappling') {
    throw new InvariantError('Le bloc grappling nécessite une activité de catégorie grappling.');
  }
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  await assertGrapplingConsistency(input.activityId, input.grappling !== undefined);
  const now = new Date().toISOString();
  const session = sessionSchema.parse({ ...input, id: newId(), createdAt: now, updatedAt: now });
  await db.sessions.add(session);
  return session;
}

export async function updateSession(id: string, patch: UpdateSessionInput): Promise<Session> {
  const existing = await db.sessions.get(id);
  if (!existing) throw new InvariantError(`Séance introuvable : ${id}`);
  const merged = sessionSchema.parse({
    ...existing,
    ...patch,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await assertGrapplingConsistency(merged.activityId, merged.grappling !== undefined);

  if (merged.date !== existing.date) {
    // Invariant 3: a date change cascades to ExerciseEntries and TechniqueLogs, same transaction.
    await db.transaction('rw', [db.sessions, db.exerciseEntries, db.techniqueLogs], async () => {
      await db.sessions.put(merged);
      await db.exerciseEntries.where('sessionId').equals(id).modify({ date: merged.date });
      await db.techniqueLogs.where('sessionId').equals(id).modify({ date: merged.date });
    });
  } else {
    await db.sessions.put(merged);
  }

  return merged;
}

/** Invariant 2: deleting a session deletes its ExerciseEntries and detaches its TechniqueLogs. */
export async function deleteSession(id: string): Promise<void> {
  await db.transaction('rw', [db.sessions, db.exerciseEntries, db.techniqueLogs], async () => {
    await db.exerciseEntries.where('sessionId').equals(id).delete();
    await db.techniqueLogs
      .where('sessionId')
      .equals(id)
      .modify((log) => {
        delete log.sessionId;
      });
    await db.sessions.delete(id);
  });
}
