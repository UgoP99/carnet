import { beforeEach, describe, expect, it } from 'vitest';
import { makeExerciseEntry } from '@/test/factories';
import { db } from './db';
import {
  archiveExercise,
  createExercise,
  deleteExercise,
  getExercise,
  updateExercise,
} from './exerciseRepo';
import { InvariantError } from './errors';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('createExercise', () => {
  it('creates an exercise', async () => {
    const exercise = await createExercise({
      name: 'Squat',
      muscleGroup: 'legs',
      metric: 'weight_reps',
    });
    expect(exercise.archived).toBe(false);
    expect(await getExercise(exercise.id)).toEqual(exercise);
  });
});

describe('updateExercise', () => {
  it('updates fields', async () => {
    const exercise = await createExercise({
      name: 'Squat',
      muscleGroup: 'legs',
      metric: 'weight_reps',
    });
    const updated = await updateExercise(exercise.id, { name: 'Back squat' });
    expect(updated.name).toBe('Back squat');
  });
});

describe('deleteExercise', () => {
  it('hard-deletes an unreferenced exercise', async () => {
    const exercise = await createExercise({
      name: 'Squat',
      muscleGroup: 'legs',
      metric: 'weight_reps',
    });
    await deleteExercise(exercise.id);
    expect(await getExercise(exercise.id)).toBeUndefined();
  });

  it('refuses to delete an exercise referenced by an ExerciseEntry (invariant 4)', async () => {
    const exercise = await createExercise({
      name: 'Squat',
      muscleGroup: 'legs',
      metric: 'weight_reps',
    });
    await db.exerciseEntries.add(makeExerciseEntry({ exerciseId: exercise.id }));

    await expect(deleteExercise(exercise.id)).rejects.toThrow(InvariantError);
  });

  it('allows archiving a referenced exercise instead', async () => {
    const exercise = await createExercise({
      name: 'Squat',
      muscleGroup: 'legs',
      metric: 'weight_reps',
    });
    await db.exerciseEntries.add(makeExerciseEntry({ exerciseId: exercise.id }));

    const archived = await archiveExercise(exercise.id);
    expect(archived.archived).toBe(true);
  });
});
