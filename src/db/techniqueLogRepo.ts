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

export interface TechniqueLogDraft {
  id: string | undefined;
  techniqueId: string;
  text: string | undefined;
}

/**
 * Replaces a session's TechniqueLogs with `drafts`: creates the new ones, updates the
 * matched ones (by `id`), deletes the ones no longer present. One transaction.
 */
export async function syncSessionTechniqueLogs(
  sessionId: string,
  date: string,
  drafts: TechniqueLogDraft[],
): Promise<void> {
  await db.transaction('rw', db.techniqueLogs, async () => {
    const existing = await db.techniqueLogs.where('sessionId').equals(sessionId).toArray();
    const draftIds = new Set(
      drafts.map((d) => d.id).filter((id): id is string => id !== undefined),
    );
    const now = new Date().toISOString();

    for (const log of existing) {
      if (!draftIds.has(log.id)) {
        await db.techniqueLogs.delete(log.id);
      }
    }

    for (const draft of drafts) {
      const current = draft.id ? existing.find((l) => l.id === draft.id) : undefined;
      if (current) {
        await db.techniqueLogs.put(
          techniqueLogSchema.parse({
            ...current,
            techniqueId: draft.techniqueId,
            text: draft.text,
            date,
            updatedAt: now,
          }),
        );
      } else {
        await db.techniqueLogs.add(
          techniqueLogSchema.parse({
            id: newId(),
            techniqueId: draft.techniqueId,
            sessionId,
            date,
            text: draft.text,
            createdAt: now,
            updatedAt: now,
          }),
        );
      }
    }
  });
}
