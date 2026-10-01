import { beforeEach, describe, expect, it } from 'vitest';
import { newId } from '@/lib/id';
import { db } from './db';
import {
  createTechniqueLog,
  listLogsForSession,
  listLogsForTechnique,
  syncSessionTechniqueLogs,
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

describe('syncSessionTechniqueLogs', () => {
  it('creates logs for a session with no existing logs', async () => {
    const sessionId = newId();
    const techniqueA = newId();
    const techniqueB = newId();

    await syncSessionTechniqueLogs(sessionId, '2026-09-28', [
      { id: undefined, techniqueId: techniqueA, text: 'Armbar setup' },
      { id: undefined, techniqueId: techniqueB, text: undefined },
    ]);

    const logs = await listLogsForSession(sessionId);
    expect(logs).toHaveLength(2);
    expect(logs.every((l) => l.date === '2026-09-28')).toBe(true);
  });

  it('updates a matched log and keeps its id', async () => {
    const sessionId = newId();
    const techniqueId = newId();
    const log = await createTechniqueLog({ techniqueId, sessionId, date: '2026-09-28' });

    await syncSessionTechniqueLogs(sessionId, '2026-09-29', [
      { id: log.id, techniqueId, text: 'Updated detail' },
    ]);

    const logs = await listLogsForSession(sessionId);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ id: log.id, text: 'Updated detail', date: '2026-09-29' });
  });

  it('deletes logs that are no longer in the draft list', async () => {
    const sessionId = newId();
    const techniqueId = newId();
    const keep = await createTechniqueLog({ techniqueId, sessionId, date: '2026-09-28' });
    await createTechniqueLog({ techniqueId: newId(), sessionId, date: '2026-09-28' });

    await syncSessionTechniqueLogs(sessionId, '2026-09-28', [
      { id: keep.id, techniqueId, text: undefined },
    ]);

    const logs = await listLogsForSession(sessionId);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.id).toBe(keep.id);
  });

  it('removes all logs when the draft list is empty', async () => {
    const sessionId = newId();
    await createTechniqueLog({ techniqueId: newId(), sessionId, date: '2026-09-28' });

    await syncSessionTechniqueLogs(sessionId, '2026-09-28', []);

    expect(await listLogsForSession(sessionId)).toHaveLength(0);
  });
});
