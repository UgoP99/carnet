import { beforeEach, describe, expect, it } from 'vitest';
import { makeGamePlanNode, makeTechniqueLog } from '@/test/factories';
import { db } from './db';
import { InvariantError } from './errors';
import {
  archiveTechnique,
  createTechnique,
  deleteTechnique,
  getTechnique,
  updateTechnique,
} from './techniqueRepo';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

const validInput = {
  name: 'Armbar',
  position: 'closed_guard' as const,
  perspective: 'bottom' as const,
  type: 'submission' as const,
  attire: 'both' as const,
  tags: [],
  videoLinks: [],
};

describe('createTechnique', () => {
  it('creates a technique with generated id and timestamps', async () => {
    const technique = await createTechnique(validInput);
    expect(technique.id).toBeTruthy();
    expect(technique.archived).toBe(false);
    expect(await getTechnique(technique.id)).toEqual(technique);
  });
});

describe('updateTechnique', () => {
  it('updates fields and keeps createdAt', async () => {
    const technique = await createTechnique(validInput);
    const updated = await updateTechnique(technique.id, { name: 'Armbar from guard' });
    expect(updated.name).toBe('Armbar from guard');
    expect(updated.createdAt).toBe(technique.createdAt);
  });
});

describe('deleteTechnique', () => {
  it('hard-deletes an unreferenced technique', async () => {
    const technique = await createTechnique(validInput);
    await deleteTechnique(technique.id);
    expect(await getTechnique(technique.id)).toBeUndefined();
  });

  it('refuses to delete a technique that has logs (invariant 5)', async () => {
    const technique = await createTechnique(validInput);
    await db.techniqueLogs.add(makeTechniqueLog({ techniqueId: technique.id }));

    await expect(deleteTechnique(technique.id)).rejects.toThrow(InvariantError);
    expect(await getTechnique(technique.id)).toBeDefined();
  });

  it('refuses to delete a technique referenced by a game-plan node', async () => {
    const technique = await createTechnique(validInput);
    await db.gamePlanNodes.add(
      makeGamePlanNode({ kind: 'technique', techniqueId: technique.id, text: undefined }),
    );

    await expect(deleteTechnique(technique.id)).rejects.toThrow(InvariantError);
  });

  it('allows archiving a referenced technique instead', async () => {
    const technique = await createTechnique(validInput);
    await db.techniqueLogs.add(makeTechniqueLog({ techniqueId: technique.id }));

    const archived = await archiveTechnique(technique.id);
    expect(archived.archived).toBe(true);
  });
});
