import { beforeEach, describe, expect, it } from 'vitest';
import { newId } from '@/lib/id';
import { makeSession } from '@/test/factories';
import { createActivity } from './activityRepo';
import {
  applyImport,
  exportBackup,
  MAX_BACKUP_CHARS,
  previewImport,
  type ImportPreview,
} from './backup';
import { db } from './db';
import { createExercise } from './exerciseRepo';
import { createExerciseEntry } from './exerciseEntryRepo';
import { ImportError } from './errors';
import { createGamePlan, createGamePlanNode } from './gamePlanRepo';
import { getSessionDraft, saveSettings, setSessionDraft } from './metaRepo';
import { createSession } from './sessionRepo';
import { createTechnique } from './techniqueRepo';
import { createTechniqueLog } from './techniqueLogRepo';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

async function snapshot() {
  return {
    activities: await db.activities.toArray(),
    sessions: await db.sessions.toArray(),
    techniques: await db.techniques.toArray(),
    techniqueLogs: await db.techniqueLogs.toArray(),
    exercises: await db.exercises.toArray(),
    exerciseEntries: await db.exerciseEntries.toArray(),
    gamePlans: await db.gamePlans.toArray(),
    gamePlanNodes: await db.gamePlanNodes.toArray(),
    meta: (await db.meta.toArray()).filter((row) => row.key !== 'sessionDraft'),
  };
}

async function seedRichData() {
  const grappling = await createActivity({
    name: 'JJB perso',
    category: 'grappling',
    color: 'violet',
    order: 99,
  });
  const strength = await createActivity({
    name: 'Muscu perso',
    category: 'strength',
    color: 'sky',
    order: 100,
  });
  const session = await createSession({
    date: '2026-09-20',
    activityId: grappling.id,
    durationMin: 60,
    rpe: 7,
    pains: [],
    grappling: { content: [], partners: [] },
  });
  const strengthSession = await createSession({
    date: '2026-09-21',
    activityId: strength.id,
    durationMin: 45,
    rpe: 6,
    pains: [],
  });
  const technique = await createTechnique({
    name: 'Kimura',
    position: 'closed_guard',
    perspective: 'bottom',
    type: 'submission',
    attire: 'both',
    tags: [],
    videoLinks: [],
  });
  await createTechniqueLog({
    techniqueId: technique.id,
    sessionId: session.id,
    date: session.date,
    text: 'Détail',
  });
  const exercise = await createExercise({
    name: 'Squat perso',
    muscleGroup: 'legs',
    metric: 'weight_reps',
  });
  await createExerciseEntry({
    sessionId: strengthSession.id,
    exerciseId: exercise.id,
    date: strengthSession.date,
    order: 0,
    sets: [{ reps: 5, weightKg: 100, warmup: false }],
  });
  const plan = await createGamePlan({ name: 'Top game perso', attire: 'gi' });
  await createGamePlanNode({
    planId: plan.id,
    parentId: null,
    order: 0,
    kind: 'technique',
    techniqueId: technique.id,
  });
  await saveSettings({ goals: { perActivity: [] }, backupReminderDays: 21 });
}

describe('exportBackup / applyImport round-trip', () => {
  it('restores an identical dataset after a replace import', async () => {
    await seedRichData();
    const before = await snapshot();

    const doc = await exportBackup();
    const preview = previewImport(JSON.stringify(doc));
    expect(preview.orphansDropped).toBe(0);

    await applyImport(preview, 'replace');
    expect(await snapshot()).toEqual(before);
  });

  it('excludes the session draft from export and replace', async () => {
    await setSessionDraft({ rpe: 7 });
    const doc = await exportBackup();
    expect(doc.data.meta.some((row) => row.key === 'sessionDraft')).toBe(false);

    await applyImport(previewImport(JSON.stringify(doc)), 'replace');
    expect(await getSessionDraft()).toBeUndefined();
  });
});

describe('previewImport: malicious or malformed input', () => {
  it('rejects a file over the size cap', () => {
    const huge = 'a'.repeat(MAX_BACKUP_CHARS + 1);
    expect(() => previewImport(huge)).toThrow(ImportError);
  });

  it('rejects invalid JSON', () => {
    expect(() => previewImport('{not json')).toThrow(ImportError);
  });

  it('rejects a document with the wrong shape', () => {
    const raw = JSON.stringify({
      app: 'carnet',
      format: 1,
      schemaVersion: 1,
      data: { sessions: 'nope' },
    });
    expect(() => previewImport(raw)).toThrow(ImportError);
  });

  it('rejects a future schema version', () => {
    const raw = JSON.stringify({
      app: 'carnet',
      format: 1,
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      data: {},
    });
    expect(() => previewImport(raw)).toThrow(ImportError);
  });

  it('strips unknown keys like __proto__ without polluting Object.prototype', () => {
    const emptyDoc = {
      app: 'carnet',
      format: 1,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        activities: [],
        sessions: [],
        techniques: [],
        techniqueLogs: [],
        exercises: [],
        exerciseEntries: [],
        gamePlans: [],
        gamePlanNodes: [],
        meta: [],
      },
    };
    const raw = JSON.stringify(emptyDoc).replace(
      '"data":',
      '"__proto__":{"polluted":true},"data":',
    );

    const preview = previewImport(raw);

    expect(preview.counts.activities).toBe(0);
    expect((Object.prototype as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('drops a session referencing a missing activity', () => {
    const raw = JSON.stringify({
      app: 'carnet',
      format: 1,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        activities: [],
        sessions: [makeSession({ activityId: newId() })],
        techniques: [],
        techniqueLogs: [],
        exercises: [],
        exerciseEntries: [],
        gamePlans: [],
        gamePlanNodes: [],
        meta: [],
      },
    });

    const preview = previewImport(raw);

    expect(preview.doc.data.sessions).toHaveLength(0);
    expect(preview.orphansDropped).toBe(1);
  });

  it('drops a meta.settings row with the wrong shape instead of storing it', () => {
    const raw = JSON.stringify({
      app: 'carnet',
      format: 1,
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        activities: [],
        sessions: [],
        techniques: [],
        techniqueLogs: [],
        exercises: [],
        exerciseEntries: [],
        gamePlans: [],
        gamePlanNodes: [],
        meta: [{ key: 'settings', value: { goals: 'not-an-object' } }],
      },
    });

    const preview = previewImport(raw);

    expect(preview.doc.data.meta).toHaveLength(0);
    expect(preview.orphansDropped).toBe(1);
  });
});

describe('applyImport: merge mode', () => {
  function previewWith(activity: { id: string; updatedAt: string }): ImportPreview {
    return {
      doc: {
        app: 'carnet',
        format: 1,
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        data: {
          activities: [
            {
              id: activity.id,
              name: 'Importée',
              category: 'other',
              color: 'slate',
              order: 1,
              archived: false,
              createdAt: activity.updatedAt,
              updatedAt: activity.updatedAt,
            },
          ],
          sessions: [],
          techniques: [],
          techniqueLogs: [],
          exercises: [],
          exerciseEntries: [],
          gamePlans: [],
          gamePlanNodes: [],
          meta: [],
        },
      },
      counts: {
        activities: 1,
        sessions: 0,
        techniques: 0,
        techniqueLogs: 0,
        exercises: 0,
        exerciseEntries: 0,
        gamePlans: 0,
        gamePlanNodes: 0,
        meta: 0,
      },
      orphansDropped: 0,
    };
  }

  it('keeps the existing record when it is newer than the imported one', async () => {
    const activity = await createActivity({
      name: 'Actuelle',
      category: 'other',
      color: 'slate',
      order: 1,
    });
    const older = new Date(Date.parse(activity.updatedAt) - 60_000).toISOString();

    await applyImport(previewWith({ id: activity.id, updatedAt: older }), 'merge');

    expect((await db.activities.get(activity.id))?.name).toBe('Actuelle');
  });

  it('adopts the imported record when it is newer', async () => {
    const activity = await createActivity({
      name: 'Actuelle',
      category: 'other',
      color: 'slate',
      order: 1,
    });
    const newer = new Date(Date.parse(activity.updatedAt) + 60_000).toISOString();

    await applyImport(previewWith({ id: activity.id, updatedAt: newer }), 'merge');

    expect((await db.activities.get(activity.id))?.name).toBe('Importée');
  });
});
