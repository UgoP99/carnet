import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('populate', () => {
  it('seeds the 6 activities from DOMAIN.md', async () => {
    const activities = await db.activities.toArray();
    expect(activities).toHaveLength(6);
    expect(activities.map((a) => a.name).sort()).toEqual(
      ['Cardio', 'Grappling', 'JJB', 'Lutte', 'Mobilité', 'Préparation physique'].sort(),
    );
  });

  it('seeds 26 exercises', async () => {
    const exercises = await db.exercises.toArray();
    expect(exercises).toHaveLength(26);
  });

  it('records seededAt in meta', async () => {
    const row = await db.meta.get('seededAt');
    expect(row?.value).toEqual(expect.any(String));
  });

  it('does not reseed on a subsequent open', async () => {
    db.close();
    await db.open();
    const activities = await db.activities.toArray();
    expect(activities).toHaveLength(6);
  });
});
