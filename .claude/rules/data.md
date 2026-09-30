---
paths:
  - 'src/db/**'
  - 'src/domain/**'
---

# Data layer rules

- `docs/DATA_MODEL.md` is the contract. Zod schemas in `src/domain/schemas.ts` are the code source of truth; types via `z.infer`, no hand-written duplicates.
- `src/domain` is pure: no Dexie, no React, no `Date.now()` inside calculations (pass `now`/`today` as arguments).
- Repositories: parse input with Zod, set `id`/`createdAt`/`updatedAt`, enforce invariants, return plain objects. Multi-table writes in `db.transaction('rw', [tables], async () => …)`; no `await` of non-Dexie promises inside a transaction.
- Query with indexes (`where('[exerciseId+date]')`, `where('date').between(...)`), not `toArray().filter()` on large tables — except search (in-memory is fine at personal scale).
- Never index booleans. Keep compound index order as declared.
- Schema/shape change → use the `db-migration` skill (Dexie version bump + upgrade + backup `schemaVersion` + migration + tests).
- Tests: fresh DB per test (`await db.delete(); await db.open();` in `beforeEach`), factories from `src/test/factories.ts`.
