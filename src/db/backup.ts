import type { Table } from 'dexie';
import {
  backupDocSchema,
  settingsSchema,
  type BackupDoc,
  type GamePlanNode,
  type TechniqueLog,
} from '@/domain/schemas';
import { db } from './db';
import { ImportError } from './errors';

export const MAX_BACKUP_CHARS = 25 * 1024 * 1024; // ~25 MB; JSON backups are mostly ASCII

const TABLE_NAMES = [
  'activities',
  'sessions',
  'techniques',
  'techniqueLogs',
  'exercises',
  'exerciseEntries',
  'gamePlans',
  'gamePlanNodes',
  'meta',
] as const;

export async function exportBackup(now: Date = new Date()): Promise<BackupDoc> {
  const [
    activities,
    sessions,
    techniques,
    techniqueLogs,
    exercises,
    exerciseEntries,
    gamePlans,
    gamePlanNodes,
    meta,
  ] = await Promise.all([
    db.activities.toArray(),
    db.sessions.toArray(),
    db.techniques.toArray(),
    db.techniqueLogs.toArray(),
    db.exercises.toArray(),
    db.exerciseEntries.toArray(),
    db.gamePlans.toArray(),
    db.gamePlanNodes.toArray(),
    db.meta.toArray(),
  ]);

  return backupDocSchema.parse({
    app: 'carnet',
    format: 1,
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    data: {
      activities,
      sessions,
      techniques,
      techniqueLogs,
      exercises,
      exerciseEntries,
      gamePlans,
      gamePlanNodes,
      meta: meta.filter((row) => row.key !== 'sessionDraft'),
    },
  });
}

export interface ImportPreview {
  doc: BackupDoc;
  counts: Record<(typeof TABLE_NAMES)[number], number>;
  orphansDropped: number;
}

function hasFutureVersion(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const { app, format, schemaVersion } = value as Record<string, unknown>;
  return app === 'carnet' && (isNewerThan(format, 1) || isNewerThan(schemaVersion, 1));
}

function isNewerThan(value: unknown, current: number): boolean {
  return typeof value === 'number' && value > current;
}

/** Parses, validates and previews an import file. Drops/detaches unresolved references. */
export function previewImport(raw: string): ImportPreview {
  if (raw.length > MAX_BACKUP_CHARS) {
    throw new ImportError('Fichier trop volumineux (25 Mo maximum).');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ImportError('Fichier JSON invalide.');
  }

  if (hasFutureVersion(parsed)) {
    throw new ImportError('Cette sauvegarde provient d’une version plus récente de Carnet.');
  }

  const result = backupDocSchema.safeParse(parsed);
  if (!result.success) {
    throw new ImportError('Fichier de sauvegarde invalide ou corrompu.');
  }

  const { doc, orphansDropped } = dropOrphans(result.data);
  const counts = Object.fromEntries(
    TABLE_NAMES.map((name) => [name, doc.data[name].length]),
  ) as ImportPreview['counts'];

  return { doc, counts, orphansDropped };
}

/** Drops records whose references don't resolve within the imported dataset; detaches where the data model allows it. */
function dropOrphans(doc: BackupDoc): { doc: BackupDoc; orphansDropped: number } {
  let dropped = 0;
  const activityIds = new Set(doc.data.activities.map((a) => a.id));
  const techniqueIds = new Set(doc.data.techniques.map((t) => t.id));
  const exerciseIds = new Set(doc.data.exercises.map((e) => e.id));
  const planIds = new Set(doc.data.gamePlans.map((p) => p.id));

  const sessions = doc.data.sessions.filter(
    (s) => activityIds.has(s.activityId) || ((dropped += 1), false),
  );
  const sessionIds = new Set(sessions.map((s) => s.id));

  const exerciseEntries = doc.data.exerciseEntries.filter(
    (e) =>
      (sessionIds.has(e.sessionId) && exerciseIds.has(e.exerciseId)) || ((dropped += 1), false),
  );

  const techniqueLogs: TechniqueLog[] = doc.data.techniqueLogs
    .filter((log) => techniqueIds.has(log.techniqueId) || ((dropped += 1), false))
    .map((log) => {
      if (log.sessionId !== undefined && !sessionIds.has(log.sessionId)) {
        dropped += 1;
        const detached = { ...log };
        delete detached.sessionId;
        return detached;
      }
      return log;
    });

  let gamePlanNodes: GamePlanNode[] = doc.data.gamePlanNodes
    .filter((n) => planIds.has(n.planId) || ((dropped += 1), false))
    .map((n) => {
      if (n.techniqueId !== undefined && !techniqueIds.has(n.techniqueId)) {
        if (n.kind === 'technique') {
          dropped += 1;
          return null;
        }
        const detached = { ...n };
        delete detached.techniqueId;
        return detached;
      }
      return n;
    })
    .filter((n): n is GamePlanNode => n !== null);

  // Cascade-drop nodes whose parent no longer exists, bounded by the max tree depth.
  for (let pass = 0; pass < 8; pass += 1) {
    const nodeIds = new Set(gamePlanNodes.map((n) => n.id));
    const before = gamePlanNodes.length;
    gamePlanNodes = gamePlanNodes.filter((n) => n.parentId === null || nodeIds.has(n.parentId));
    dropped += before - gamePlanNodes.length;
    if (gamePlanNodes.length === before) break;
  }

  const meta = doc.data.meta.filter((row) => isValidMetaRow(row) || ((dropped += 1), false));

  return {
    doc: {
      ...doc,
      data: { ...doc.data, sessions, exerciseEntries, techniqueLogs, gamePlanNodes, meta },
    },
    orphansDropped: dropped,
  };
}

/** Validates known meta keys against their real schema; unknown keys pass through untouched. */
function isValidMetaRow(row: { key: string; value: unknown }): boolean {
  switch (row.key) {
    case 'settings':
      return settingsSchema.safeParse(row.value).success;
    case 'lastExportAt':
    case 'seededAt':
      return typeof row.value === 'string';
    default:
      return true;
  }
}

async function mergeTable<T extends { id: string; updatedAt: string }>(
  table: Table<T, string>,
  rows: T[],
): Promise<void> {
  for (const row of rows) {
    const existing = await table.get(row.id);
    if (!existing || existing.updatedAt < row.updatedAt) {
      await table.put(row);
    }
  }
}

export async function applyImport(
  preview: ImportPreview,
  mode: 'replace' | 'merge',
): Promise<void> {
  const { data } = preview.doc;
  const tables = [
    db.activities,
    db.sessions,
    db.techniques,
    db.techniqueLogs,
    db.exercises,
    db.exerciseEntries,
    db.gamePlans,
    db.gamePlanNodes,
    db.meta,
  ];

  await db.transaction('rw', tables, async () => {
    if (mode === 'replace') {
      await Promise.all(tables.map((table) => table.clear()));
      await db.activities.bulkAdd(data.activities);
      await db.sessions.bulkAdd(data.sessions);
      await db.techniques.bulkAdd(data.techniques);
      await db.techniqueLogs.bulkAdd(data.techniqueLogs);
      await db.exercises.bulkAdd(data.exercises);
      await db.exerciseEntries.bulkAdd(data.exerciseEntries);
      await db.gamePlans.bulkAdd(data.gamePlans);
      await db.gamePlanNodes.bulkAdd(data.gamePlanNodes);
      await db.meta.bulkAdd(data.meta);
      return;
    }

    await mergeTable(db.activities, data.activities);
    await mergeTable(db.sessions, data.sessions);
    await mergeTable(db.techniques, data.techniques);
    await mergeTable(db.techniqueLogs, data.techniqueLogs);
    await mergeTable(db.exercises, data.exercises);
    await mergeTable(db.exerciseEntries, data.exerciseEntries);
    await mergeTable(db.gamePlans, data.gamePlans);
    await mergeTable(db.gamePlanNodes, data.gamePlanNodes);
    for (const row of data.meta) {
      await db.meta.put(row);
    }
  });
}
