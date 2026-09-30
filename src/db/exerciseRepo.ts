import Dexie from 'dexie';
import { newId } from '@/lib/id';
import { exerciseSchema, type Exercise } from '@/domain/schemas';
import { db } from './db';
import { InvariantError } from './errors';

export type CreateExerciseInput = Omit<Exercise, 'id' | 'archived' | 'createdAt' | 'updatedAt'>;
export type UpdateExerciseInput = Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>;

export async function listExercises(): Promise<Exercise[]> {
  return db.exercises.toArray();
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  return db.exercises.get(id);
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const now = new Date().toISOString();
  const exercise = exerciseSchema.parse({
    ...input,
    id: newId(),
    archived: false,
    createdAt: now,
    updatedAt: now,
  });
  await db.exercises.add(exercise);
  return exercise;
}

export async function updateExercise(id: string, patch: UpdateExerciseInput): Promise<Exercise> {
  const existing = await db.exercises.get(id);
  if (!existing) throw new InvariantError(`Exercice introuvable : ${id}`);
  const updated = exerciseSchema.parse({
    ...existing,
    ...patch,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await db.exercises.put(updated);
  return updated;
}

export async function archiveExercise(id: string): Promise<Exercise> {
  return updateExercise(id, { archived: true });
}

/** Hard-deletes an exercise — only allowed when no ExerciseEntry references it (invariant 4). */
export async function deleteExercise(id: string): Promise<void> {
  const referenced = await db.exerciseEntries
    .where('[exerciseId+date]')
    .between([id, Dexie.minKey], [id, Dexie.maxKey])
    .count();
  if (referenced > 0) {
    throw new InvariantError('Exercice utilisé par des séances : archive-le plutôt.');
  }
  await db.exercises.delete(id);
}
