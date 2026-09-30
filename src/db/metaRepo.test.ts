import { beforeEach, describe, expect, it } from 'vitest';
import { newId } from '@/lib/id';
import { db } from './db';
import {
  clearSessionDraft,
  getLastExportAt,
  getSessionDraft,
  getSettings,
  saveSettings,
  setLastExportAt,
  setSessionDraft,
} from './metaRepo';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('getSettings', () => {
  it('returns defaults when nothing was saved', async () => {
    expect(await getSettings()).toEqual({ goals: { perActivity: [] }, backupReminderDays: 14 });
  });
});

describe('saveSettings / getSettings', () => {
  it('round-trips validated settings', async () => {
    const saved = await saveSettings({
      goals: { weeklyMinutes: 180, perActivity: [{ activityId: newId(), sessionsPerWeek: 3 }] },
      backupReminderDays: 30,
    });
    expect(saved.backupReminderDays).toBe(30);
    expect(await getSettings()).toEqual(saved);
  });
});

describe('lastExportAt', () => {
  it('is undefined until set', async () => {
    expect(await getLastExportAt()).toBeUndefined();
  });

  it('round-trips a timestamp', async () => {
    const ts = new Date().toISOString();
    await setLastExportAt(ts);
    expect(await getLastExportAt()).toBe(ts);
  });
});

describe('sessionDraft', () => {
  it('round-trips and clears', async () => {
    await setSessionDraft({ rpe: 7 });
    expect(await getSessionDraft()).toEqual({ rpe: 7 });
    await clearSessionDraft();
    expect(await getSessionDraft()).toBeUndefined();
  });
});
