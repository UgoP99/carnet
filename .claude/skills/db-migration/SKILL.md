---
name: db-migration
description: Procedure to change the Dexie schema or the shape of any stored entity (fields, enums, indexes) safely. Use whenever a change touches src/domain/schemas.ts or src/db/db.ts stores.
---

Changing stored data shapes — follow in order:

1. Ask me first; describe the change and why (data model changes need approval).
2. Update `docs/DATA_MODEL.md` (entity + bump "schemaVersion N" in the title) and the Zod schemas.
3. `src/db/db.ts`: add `db.version(N+1).stores({...only changed tables...}).upgrade(tx => …)`. Never edit or remove an existing `version()` block.
4. The upgrade must be idempotent and never drop user data silently (map old enum values, default new required fields).
5. Backup: bump `schemaVersion` constant; add a pure migration `migrateVnToVn+1(doc)` in `src/db/migrations.ts` so older backups still import.
6. Tests: (a) open a DB created at version N with fixture data, upgrade, assert data; (b) import a vN backup fixture into vN+1; (c) round-trip export/import at vN+1.
7. Append a `docs/DECISIONS.md` entry. Remind me to export a backup on the phone before deploying.
