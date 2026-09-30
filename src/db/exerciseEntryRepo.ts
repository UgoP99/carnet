import Dexie from 'dexie';
import { newId } from '@/lib/id';
import { exerciseEntrySchema, type ExerciseEntry } from '@/domain/schemas';
import { db } from './db';
import { InvariantError } from './errors';

export type CreateExerciseEntryInput = Omit<ExerciseEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExerciseEntryInput = Partial<
  Omit<ExerciseEntry, 'id' | 'sessionId' | 'exerciseId' | 'createdAt' | 'updatedAt'>
>;

export async function listEntriesForSession(sessionId: string): Promise<ExerciseEntry[]> {
  const entries = await db.exerciseEntries.where('sessionId').equals(sessionId).toArray();
  return entries.sort((a, b) => a.order - b.order);
}

/** Most recent entry for an exercise, excluding the given session — "Last time" lookup. */
export async function getLastEntry(
  exerciseId: string,
  excludeSessionId?: string,
): Promise<ExerciseEntry | undefined> {
  const entries = await db.exerciseEntries
    .where('[exerciseId+date]')
    .between([exerciseId, Dexie.minKey], [exerciseId, Dexie.maxKey])
    .toArray();
  return entries
    .filter((e) => e.sessionId !== excludeSessionId)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))[0];
}

async function assertStrengthSession(sessionId: string): Promise<void> {
  const session = await db.sessions.get(sessionId);
  if (!session) throw new InvariantError(`Séance introuvable : ${sessionId}`);
  const activity = await db.activities.get(session.activityId);
  if (activity?.category !== 'strength') {
    throw new InvariantError('Exercices de renforcement réservés aux séances de renforcement.');
  }
}

export async function createExerciseEntry(input: CreateExerciseEntryInput): Promise<ExerciseEntry> {
  await assertStrengthSession(input.sessionId);
  const now = new Date().toISOString();
  const entry = exerciseEntrySchema.parse({
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  });
  await db.exerciseEntries.add(entry);
  return entry;
}

export async function updateExerciseEntry(
  id: string,
  patch: UpdateExerciseEntryInput,
): Promise<ExerciseEntry> {
  const existing = await db.exerciseEntries.get(id);
  if (!existing) throw new InvariantError(`Entrée introuvable : ${id}`);
  const updated = exerciseEntrySchema.parse({
    ...existing,
    ...patch,
    id,
    sessionId: existing.sessionId,
    exerciseId: existing.exerciseId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await db.exerciseEntries.put(updated);
  return updated;
}

export async function deleteExerciseEntry(id: string): Promise<void> {
  await db.exerciseEntries.delete(id);
}
