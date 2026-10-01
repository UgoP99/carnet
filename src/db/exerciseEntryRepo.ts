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

/** All entries for an exercise, sorted by date ascending — for progression charts. */
export async function listEntriesForExercise(exerciseId: string): Promise<ExerciseEntry[]> {
  const entries = await db.exerciseEntries
    .where('[exerciseId+date]')
    .between([exerciseId, Dexie.minKey], [exerciseId, Dexie.maxKey])
    .toArray();
  return entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
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

export interface ExerciseEntryDraft {
  id: string | undefined;
  exerciseId: string;
  order: number;
  sets: ExerciseEntry['sets'];
}

/**
 * Replaces a session's ExerciseEntries with `drafts`: creates the new ones, updates the
 * matched ones (by `id`), deletes the ones no longer present. One transaction.
 */
export async function syncSessionExerciseEntries(
  sessionId: string,
  date: string,
  drafts: ExerciseEntryDraft[],
): Promise<void> {
  await db.transaction('rw', db.exerciseEntries, async () => {
    const existing = await db.exerciseEntries.where('sessionId').equals(sessionId).toArray();
    const draftIds = new Set(
      drafts.map((d) => d.id).filter((id): id is string => id !== undefined),
    );
    const now = new Date().toISOString();

    for (const entry of existing) {
      if (!draftIds.has(entry.id)) {
        await db.exerciseEntries.delete(entry.id);
      }
    }

    for (const draft of drafts) {
      const current = draft.id ? existing.find((e) => e.id === draft.id) : undefined;
      if (current) {
        await db.exerciseEntries.put(
          exerciseEntrySchema.parse({
            ...current,
            exerciseId: draft.exerciseId,
            order: draft.order,
            sets: draft.sets,
            date,
            updatedAt: now,
          }),
        );
      } else {
        await db.exerciseEntries.add(
          exerciseEntrySchema.parse({
            id: newId(),
            sessionId,
            exerciseId: draft.exerciseId,
            date,
            order: draft.order,
            sets: draft.sets,
            createdAt: now,
            updatedAt: now,
          }),
        );
      }
    }
  });
}
