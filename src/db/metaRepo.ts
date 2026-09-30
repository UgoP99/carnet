import { settingsSchema, type Settings } from '@/domain/schemas';
import { db } from './db';

const DEFAULT_SETTINGS: Settings = { goals: { perActivity: [] }, backupReminderDays: 14 };

export async function getSettings(): Promise<Settings> {
  const row = await db.meta.get('settings');
  if (!row) return DEFAULT_SETTINGS;
  return settingsSchema.parse(row.value);
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  const parsed = settingsSchema.parse(settings);
  await db.meta.put({ key: 'settings', value: parsed });
  return parsed;
}

export async function getLastExportAt(): Promise<string | undefined> {
  const row = await db.meta.get('lastExportAt');
  return typeof row?.value === 'string' ? row.value : undefined;
}

export async function setLastExportAt(timestamp: string): Promise<void> {
  await db.meta.put({ key: 'lastExportAt', value: timestamp });
}

export async function getSessionDraft(): Promise<unknown> {
  const row = await db.meta.get('sessionDraft');
  return row?.value;
}

export async function setSessionDraft(draft: unknown): Promise<void> {
  await db.meta.put({ key: 'sessionDraft', value: draft });
}

export async function clearSessionDraft(): Promise<void> {
  await db.meta.delete('sessionDraft');
}
