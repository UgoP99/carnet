import { newId } from '@/lib/id';
import { techniqueSchema, type Technique } from '@/domain/schemas';
import { db } from './db';
import { InvariantError } from './errors';

export type CreateTechniqueInput = Omit<Technique, 'id' | 'archived' | 'createdAt' | 'updatedAt'>;
export type UpdateTechniqueInput = Partial<Omit<Technique, 'id' | 'createdAt' | 'updatedAt'>>;

export async function listTechniques(): Promise<Technique[]> {
  return db.techniques.toArray();
}

export async function getTechnique(id: string): Promise<Technique | undefined> {
  return db.techniques.get(id);
}

export async function createTechnique(input: CreateTechniqueInput): Promise<Technique> {
  const now = new Date().toISOString();
  const technique = techniqueSchema.parse({
    ...input,
    id: newId(),
    archived: false,
    createdAt: now,
    updatedAt: now,
  });
  await db.techniques.add(technique);
  return technique;
}

export async function updateTechnique(id: string, patch: UpdateTechniqueInput): Promise<Technique> {
  const existing = await db.techniques.get(id);
  if (!existing) throw new InvariantError(`Technique introuvable : ${id}`);
  const updated = techniqueSchema.parse({
    ...existing,
    ...patch,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await db.techniques.put(updated);
  return updated;
}

export async function archiveTechnique(id: string): Promise<Technique> {
  return updateTechnique(id, { archived: true });
}

/** Hard-deletes a technique — only allowed with no logs and no game-plan references (invariants 4–5). */
export async function deleteTechnique(id: string): Promise<void> {
  const [logCount, nodeCount] = await Promise.all([
    db.techniqueLogs.where('techniqueId').equals(id).count(),
    db.gamePlanNodes.filter((n) => n.techniqueId === id).count(),
  ]);
  if (logCount > 0) {
    throw new InvariantError('Technique avec des logs : archive-la plutôt.');
  }
  if (nodeCount > 0) {
    throw new InvariantError('Technique utilisée dans un plan de jeu : archive-la plutôt.');
  }
  await db.techniques.delete(id);
}
