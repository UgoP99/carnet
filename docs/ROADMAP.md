# ROADMAP — v1

Format: `### [ ]` = todo, `### [x]` = done (the SessionStart hook reads the first `### [ ]`).
Each step = one session = one commit (or a few). "Read" lists the only docs needed.

### [x] 0. Scaffold

Vite + React + TS strict, Tailwind, ESLint (security rules), Prettier, Vitest + fake-indexeddb, vite-plugin-pwa, build-time CSP, icons, CI/deploy/CodeQL/Dependabot, Claude Code config. Verified: build OK, app renders under CSP, SW activates.

### [x] 1. Domain & database

Read: DATA_MODEL (all), DOMAIN (enums, seeds).

- `src/lib/id.ts` (`newId`, UUID v4 via getRandomValues), `src/lib/dates.ts` (`todayLocal`, `isoWeekKey`, `weekRange`, `addWeeks`), `src/lib/url.ts` (`parseHttpsUrl`), `src/lib/text.ts` (`normalize` for accent-insensitive search).
- `src/domain/schemas.ts` (all entities + backup doc), `labels.ts`, `load.ts` (load, weekly totals, trend), `strength.ts` (e1RM, best set).
- `src/db/db.ts` (Dexie v1 schema, populate → seed), `seed.ts`, repositories for activities, sessions (+ invariants 1–3, 7), techniques, techniqueLogs, exercises, exerciseEntries, gamePlans (+ nodes, invariant 6), meta/settings.
- Test factories in `src/test/factories.ts`.

Done when: all invariants in DATA_MODEL have tests; week helpers tested across year boundary (2026-W53/2027-W01) and DST; `parseHttpsUrl` rejects `javascript:`, `data:`, `http:`, credentials; coverage of domain+db logic is high (no UI yet).

### [x] 2. App shell

Read: ARCHITECTURE (Routing, Patterns), SPEC §3.

- HashRouter with all routes (placeholder screens), Layout with bottom tab bar (5 tabs, lucide icons, active state), header with search button, safe-area padding, dark/light.
- `ui/` primitives: Button, Field (label + error), Chips (single/multi), Segmented, Stepper (+/−), ConfirmDialog, EmptyState.
- Error boundary with "Exporter mes données" (wire later in step 4 — show disabled placeholder now).

Done when: navigation works at 375 px; tab targets ≥44 px; keyboard focus visible; test that each route renders.

### [x] 3. Sessions (generic)

Read: SPEC §4.1 (base fields, journal, detail, actions), DOMAIN (Intensity).

- SessionForm base fields (activity chips by usage, date, start time, duration presets, RpeInput with CR-10 labels, energy, pains, notes), Zod validation, draft autosave/restore (`meta.sessionDraft`).
- Journal grouped by week, filter by activity, paging. SessionDetail. Edit, delete (confirm), duplicate.

Done when: a session is logged in ≤ 5 taps + typing with defaults; draft survives reload; invariants hold through the UI; tests for create/edit/delete/duplicate flows.

### [x] 4. Backup & storage (do before real use)

Read: DATA_MODEL (Backup format), SECURITY (import rows + checklist), SPEC §4.6.

- `db/backup.ts`: export all tables (except draft) → JSON; `lib/share.ts`: Web Share API with file (iOS) or download fallback; set `lastExportAt`.
- Import: file input → pipeline (size cap, parse, Zod, version check, migrate, orphans) → preview → Remplacer / Fusionner, transactional.
- Settings > Sauvegarde screen; reminder banner on Semaine; error-boundary export button; `navigator.storage.persist()` + status/estimate.

Done when: round-trip test (export → wipe → import = identical); malicious-input tests (bad JSON, >25 MB, wrong types, huge strings, `__proto__`, future version, orphans); `security-check` run and clean.

### [x] 5. Grappling block + quick technique creation

Read: SPEC §4.1 (grappling block), DOMAIN (Grappling).

- GrapplingSection: attire, content chips, rounds/round length, subs +/−, partners (chips + autocomplete from history).
- TechniquePicker: search existing (accent-insensitive), create inline (name + position [+ perspective/type optional]); per-technique detail text → TechniqueLogs saved with the session (transaction).

Done when: logging a BJJ class with 2 techniques and details takes < 1 min; logs appear with correct date; editing the session edits/removes its logs correctly.

### [x] 6. Technique library

Read: SPEC §4.2, DOMAIN (Position, Perspective, TechniqueType).

- List grouped by position (collapsible), filters (type, perspective, attire, tags), search, counters (times seen, last seen).
- Detail: fields, video links (validated, open externally), timeline of logs with session links, add standalone note.
- Form create/edit; archive/delete rules (invariant 4–5).

Done when: filters combine correctly (tests); invalid URLs rejected in form; archived techniques hidden from picker.

### [x] 7. Strength block

Read: SPEC §4.1 (strength block), DOMAIN (Strength), DATA_MODEL (ExerciseEntry, derived values).

- StrengthSection: add exercise (picker + create), sets editor adapted to metric, warm-up toggle, RIR optional, reorder exercises; "Dernière fois : …" + prefill from last entry.
- Settings > Exercices (CRUD/archive). Session detail shows e1RM per set and best set.

Done when: logging 4 exercises × 3 sets with prefill is fast (numeric keypad via `inputMode="decimal"`); last-time lookup excludes current session (test).

### [x] 8. Week dashboard + goals

Read: SPEC §4.3 (Semaine), DATA_MODEL (derived values, Meta.settings).

- WeekView: week navigation (`?w=`), 7-day strip, totals, per-activity breakdown, trend %, goals progress, backup banner.
- Settings > Objectifs (weekly minutes, sessions/week per activity) and Activités (CRUD, color, order, archive).

Done when: totals match domain tests; weeks spanning months/years display correctly; empty week has a friendly empty state.

### [x] 9. Stats

Read: SPEC §4.3 (Stats).

- Lazy StatsView: 12-week stacked load bars by category (SVG, accessible table fallback), minutes per activity, month calendar heatmap, per-exercise e1RM progression.

Done when: charts render from domain functions (tested), readable in dark/light, no chart dependency.

### [x] 10. Game plans

Read: SPEC §4.4, DATA_MODEL (GamePlan, GamePlanNode, invariant 6).

- Plans list; lazy PlanEditor: outline tree, add child/sibling, edit (kind, position/technique/note, condition), reorder, indent/outdent, collapse, delete subtree; view mode with technique links.

Done when: tree operations are unit-tested (move, indent/outdent, delete subtree, depth limit, no cycles); usable one-handed.

### [x] 11. Search

Read: SPEC §4.5.

- SearchView with grouped results across sessions, techniques, logs, plans; plain-text highlight; debounce.

Done when: accent/case-insensitive tests pass; 2 000 sessions search < 200 ms on test data.

### [x] 12. PWA polish & accessibility

Read: ARCHITECTURE (PWA & storage), SPEC §5.

- Update prompt (`useRegisterSW`), install instructions screen for iOS (Partager → Sur l'écran d'accueil), offline check, splash/theme colors, reduced motion, a11y pass (labels, contrast, focus), bundle size check (≤300 kB gz initial).

Done when: Lighthouse PWA/a11y pass locally (`npm run build && npm run preview`); works in airplane mode on iPhone.

### [ ] 13. Release v1.0.0

- `security-check` on the whole app, `npm audit` clean, `/release minor`, deploy, install on iPhone, first backup exported.
