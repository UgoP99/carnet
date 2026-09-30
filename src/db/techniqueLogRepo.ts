import { newId } from '@/lib/id';
import { techniqueLogSchema, type TechniqueLog } from '@/domain/schemas';
import { db } from './db';
import { InvariantError } from './errors';

export type CreateTechniqueLogInput = Omit<TechniqueLog, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTechniqueLogInput = Partial<
  Omit<TechniqueLog, 'id' | 'techniqueId' | 'createdAt' | 'updatedAt'>
>;

export async function listLogsForTechnique(techniqueId: string): Promise<TechniqueLog[]> {
  return db.techniqueLogs.where('techniqueId').equals(techniqueId).toArray();
}

export async function listLogsForSession(sessionId: string): Promise<TechniqueLog[]> {
  return db.techniqueLogs.where('sessionId').equals(sessionId).toArray();
}

export async function createTechniqueLog(input: CreateTechniqueLogInput): Promise<TechniqueLog> {
  const now = new Date().toISOString();
  const log = techniqueLogSchema.parse({ ...input, id: newId(), createdAt: now, updatedAt: now });
  await db.techniqueLogs.add(log);
  return log;
}

export async function updateTechniqueLog(
  id: string,
  patch: UpdateTechniqueLogInput,
): Promise<TechniqueLog> {
  const existing = await db.techniqueLogs.get(id);
  if (!existing) throw new InvariantError(`Log introuvable : ${id}`);
  const updated = techniqueLogSchema.parse({
    ...existing,
    ...patch,
    id,
    techniqueId: existing.techniqueId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await db.techniqueLogs.put(updated);
  return updated;
}

export async function deleteTechniqueLog(id: string): Promise<void> {
  await db.techniqueLogs.delete(id);
}
