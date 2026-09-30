# DATA MODEL (schemaVersion 1)

Source of truth in code: Zod schemas in `src/domain/schemas.ts` (types via `z.infer`). This doc is the contract; keep both in sync.

## Conventions

- `ID` = UUID v4 string from `newId()` (`src/lib/id.ts`, uses `crypto.getRandomValues`; works in non-secure LAN dev too).
- `LocalDate` = `YYYY-MM-DD` in the user's local time. Never store a `Date` object for calendar days.
- `Timestamp` = ISO 8601 UTC string (`new Date().toISOString()`).
- Every entity has `createdAt`, `updatedAt` (Timestamp). Repositories set them; UI never does.
- Strings are trimmed; empty optional strings are stored as absent (not `""`).
- Booleans are never indexed (IndexedDB cannot index them).
- Enums and their French labels live in `src/domain/labels.ts` (values from DOMAIN.md).

## Entities

```ts
type ActivityCategory = 'grappling' | 'strength' | 'conditioning' | 'mobility' | 'other';
type ActivityColor = 'red' | 'orange' | 'amber' | 'emerald' | 'teal' | 'sky' | 'violet' | 'slate';

Activity {
  id; name: string(1..40); category: ActivityCategory; color: ActivityColor;
  order: int; archived: boolean; createdAt; updatedAt;
}

Session {
  id; date: LocalDate; startTime?: 'HH:mm';
  activityId: ID;
  durationMin: int(1..600);
  rpe: int(1..10);                 // CR-10 session RPE
  energy?: int(1..5);              // readiness before the session
  pains: PainEntry[] (max 10);
  notes?: string(..10000);
  distanceKm?: number(0..1000);    // conditioning
  grappling?: GrapplingBlock;      // only when activity.category === 'grappling'
  createdAt; updatedAt;
}
PainEntry { zone: BodyZone; level: 1 | 2 | 3 }

GrapplingBlock {
  attire?: 'gi' | 'nogi';
  content: SessionContent[];       // multi-select; may be empty
  sparringRounds?: int(0..50); roundMin?: number(0.5..30);
  subsLanded?: int(0..99); subsConceded?: int(0..99);
  partners: string(1..40)[] (max 20);
}
type SessionContent = 'technique' | 'drill' | 'positional' | 'sparring' | 'open_mat' | 'competition';

Technique {
  id; name: string(1..80);
  position: Position; perspective: 'top' | 'bottom' | 'neutral';
  type: TechniqueType; attire: 'gi' | 'nogi' | 'both';
  tags: string(1..30)[] (max 15, lowercase, unique);
  summary?: string(..5000);        // key points
  videoLinks: { url: HttpsUrl; label?: string(..60) }[] (max 10);
  archived: boolean; createdAt; updatedAt;
}

TechniqueLog {                     // a detail about a technique, from a session or standalone
  id; techniqueId: ID; sessionId?: ID;
  date: LocalDate;                 // = session.date when linked (denormalized)
  text?: string(..5000);           // absent = "seen in this session" without detail
  createdAt; updatedAt;
}

Exercise {
  id; name: string(1..60); muscleGroup: MuscleGroup;
  metric: 'weight_reps' | 'reps' | 'time' | 'distance';
  archived: boolean; createdAt; updatedAt;
}

ExerciseEntry {                    // one exercise performed within a strength session
  id; sessionId: ID; exerciseId: ID;
  date: LocalDate;                 // = session.date (denormalized for "last time" lookups)
  order: int; note?: string(..1000);
  sets: SetEntry[] (1..30);
  createdAt; updatedAt;
}
SetEntry {
  reps?: int(0..999); weightKg?: number(0..1000, step 0.25);   // weight_reps; reps (+ optional added load)
  durationSec?: int(1..36000);                               // time
  distanceM?: int(1..100000);                                // distance
  rir?: int(0..5); warmup: boolean;
}

GamePlan { id; name: string(1..60); description?: string(..2000); attire: 'gi' | 'nogi' | 'both'; createdAt; updatedAt }

GamePlanNode {
  id; planId: ID; parentId: ID | null; order: int;
  kind: 'position' | 'technique' | 'note';
  position?: Position;             // kind = position
  techniqueId?: ID;                // kind = technique
  text?: string(..500);            // kind = note (required), optional comment otherwise
  condition?: string(..80);        // "s'il sprawl"
  createdAt; updatedAt;
}

Meta { key: string; value: unknown }   // key-value table
  'settings'     → { goals: { weeklyMinutes?: int; perActivity: { activityId: ID; sessionsPerWeek: int(1..14) }[] };
                     backupReminderDays: int(3..90) = 14 }
  'lastExportAt' → Timestamp
  'sessionDraft' → partial session form state (never exported)
  'seededAt'     → Timestamp (seed runs once)
```

`Position`, `TechniqueType`, `BodyZone`, `MuscleGroup` value lists: see DOMAIN.md.

## Dexie schema (`src/db/db.ts`)

```ts
db.version(1).stores({
  activities: 'id, order',
  sessions: 'id, date, activityId, [activityId+date]',
  techniques: 'id, name, position, type, *tags',
  techniqueLogs: 'id, techniqueId, sessionId, date',
  exercises: 'id, name',
  exerciseEntries: 'id, sessionId, [exerciseId+date]',
  gamePlans: 'id, name',
  gamePlanNodes: 'id, planId, parentId',
  meta: 'key',
});
```

DB name: `carnet`. Seed (activities + exercises from DOMAIN.md) runs once in `db.on('populate')`.

## Invariants (enforced in repositories, covered by tests)

1. `session.grappling` present only if the activity category is grappling; exercise entries only for strength (switching activity category on edit asks to drop incompatible data).
2. Deleting a session: delete its ExerciseEntries; **detach** its TechniqueLogs (`sessionId` removed, text kept). One transaction.
3. Changing a session date updates `date` on its ExerciseEntries and TechniqueLogs. Same transaction.
4. Activity, Technique, Exercise referenced anywhere → archive only; unreferenced → hard delete allowed.
5. Deleting a technique that has logs is impossible (archive). Archived items are hidden from pickers but still displayed where referenced.
6. GamePlanNode: parent must belong to the same plan; no cycles; depth ≤ 8; deleting a node deletes its subtree.
7. `updatedAt` changes on every write.

## Derived values (`src/domain`, pure functions, unit-tested)

- Session load (UA) = `durationMin × rpe`.
- Week bounds: ISO week (Mon–Sun), key `YYYY-Www`.
- Weekly totals: sessions, minutes, load; per activity and per category.
- Trend = this week load / mean load of the 4 previous weeks (null if <2 weeks of history).
- e1RM (Epley) = `weightKg × (1 + reps / 30)`, only for non-warmup sets with 1 ≤ reps ≤ 12 and weightKg > 0.
- "Last time" for an exercise = most recent ExerciseEntry by `[exerciseId+date]` excluding the current session.

## Backup format (export/import)

```json
{
  "app": "carnet",
  "format": 1,
  "schemaVersion": 1,
  "exportedAt": "2026-10-01T18:00:00.000Z",
  "data": {
    "activities": [],
    "sessions": [],
    "techniques": [],
    "techniqueLogs": [],
    "exercises": [],
    "exerciseEntries": [],
    "gamePlans": [],
    "gamePlanNodes": [],
    "meta": []
  }
}
```

- File name: `carnet-backup-YYYY-MM-DD.json`. `meta` excludes `sessionDraft`.
- Import pipeline: size ≤ 25 MB → `JSON.parse` in try/catch → Zod parse of the whole document (unknown keys stripped) → reject if `app !== 'carnet'` or `format`/`schemaVersion` newer than supported → migrate older versions with pure functions (`src/db/migrations.ts`) → referential check (report orphans, drop them) → preview counts → user chooses:
  - **Remplacer tout**: clear all tables + bulkAdd, single transaction.
  - **Fusionner**: upsert by `id`, keep the record with the newer `updatedAt`.
- After a successful export, set `lastExportAt`.
