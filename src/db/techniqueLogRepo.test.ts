import { beforeEach, describe, expect, it } from 'vitest';
import { newId } from '@/lib/id';
import { db } from './db';
import {
  createTechniqueLog,
  listLogsForSession,
  listLogsForTechnique,
  updateTechniqueLog,
} from './techniqueLogRepo';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('createTechniqueLog', () => {
  it('creates a standalone log (no session)', async () => {
    const techniqueId = newId();
    const log = await createTechniqueLog({ techniqueId, date: '2026-09-28', text: 'Setup notes' });
    expect(log.id).toBeTruthy();
    expect(log.sessionId).toBeUndefined();
  });

  it('creates a log linked to a session', async () => {
    const techniqueId = newId();
    const sessionId = newId();
    const log = await createTechniqueLog({ techniqueId, sessionId, date: '2026-09-28' });
    expect(log.sessionId).toBe(sessionId);
  });
});

describe('listLogsForTechnique / listLogsForSession', () => {
  it('filters logs by technique and by session', async () => {
    const techniqueA = newId();
    const techniqueB = newId();
    const sessionId = newId();
    await createTechniqueLog({ techniqueId: techniqueA, sessionId, date: '2026-09-28' });
    await createTechniqueLog({ techniqueId: techniqueB, date: '2026-09-29' });

    expect(await listLogsForTechnique(techniqueA)).toHaveLength(1);
    expect(await listLogsForSession(sessionId)).toHaveLength(1);
  });
});

describe('updateTechniqueLog', () => {
  it('updates text without changing techniqueId', async () => {
    const techniqueId = newId();
    const log = await createTechniqueLog({ techniqueId, date: '2026-09-28' });
    const updated = await updateTechniqueLog(log.id, { text: 'Detail' });
    expect(updated.text).toBe('Detail');
    expect(updated.techniqueId).toBe(techniqueId);
  });
});
