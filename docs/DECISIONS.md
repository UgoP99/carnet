# DECISIONS (ADR-lite)

Format: `D<n> — <date> — <title>`: context → decision → consequence. Append only; supersede with a new entry.

D1 — 2026-09-30 — PWA local-first instead of native iOS app
Need: iPhone, personal use, Windows dev machine (no Xcode), zero cost. → React PWA, data in IndexedDB, no backend. → No App Store, no server attack surface; iOS storage eviction risk mitigated by home-screen install, `storage.persist()`, backups.

D2 — 2026-09-30 — Hosting on GitHub Pages
Free and simple; requires a public repo on GitHub Free (fine: no secrets, no personal data in code). Cloudflare Pages would allow a private repo and a dedicated origin — possible later (export data before changing URL).

D3 — 2026-09-30 — HashRouter
GitHub Pages has no SPA rewrite; hash routes avoid the 404 hack and work offline.

D4 — 2026-09-30 — Plain-text notes in v1
No Markdown rendering → no HTML sanitizer, no XSS surface. Line breaks preserved.

D5 — 2026-09-30 — Intensity = session RPE (CR-10) × duration
Validated, sport-agnostic load metric. No ACWR/injury-risk labels (contested).

D6 — 2026-09-30 — Game plans as trees (outline), not free graphs
Mobile-friendly editing; graph view deferred to v2.

D7 — 2026-09-30 — No chart library
A few SVG charts are simple; fewer deps = smaller bundle and supply-chain surface.

D8 — 2026-09-30 — Supply-chain hygiene
Exact versions, lockfile, `ignore-scripts=true`, only versions ≥7 days old (a package published minutes earlier was already unreachable during scaffolding), Dependabot cooldown, SHA-pinned Actions.

D9 — 2026-09-30 — TypeScript 6.0 pinned
TS 7 is out but typescript-eslint supports <6.1. Revisit when it supports 7.

D10 — 2026-09-30 — Claude-facing docs in English, UI in French
English costs fewer tokens; docs split by topic and loaded on demand; path-scoped rules.

D11 — 2026-09-30 — Technique logs are detached, not deleted, with their session
Technical knowledge outlives the session record.

D12 — 2026-09-30 — `labels.ts` split into `labels.ts` + `labels.grappling.ts`
The full enum+label table was exactly 250 lines (files must stay <250). Split by domain (general vs grappling-specific); `labels.ts` re-exports `labels.grappling.ts` so `@/domain/labels` stays the single import path described in ARCHITECTURE.md.

D13 — 2026-09-30 — Trend formula: current load ÷ mean of the last 4 weeks (zero weeks included in the denominator), null unless ≥2 of those weeks have load
DOMAIN.md states the ratio but not how empty weeks are averaged; averaging over all 4 (not just non-zero weeks) keeps the ratio comparable week to week. Revisit if it reads oddly in the Semaine view (step 8).

D14 — 2026-09-30 — "Best set" per exercise metric: highest e1RM (weight_reps), most reps (reps), longest duration (time), longest distance (distance)
DATA_MODEL.md only defines e1RM; extended the same idea to the other three metrics so every exercise has a sensible "best set" in session detail (step 7).

D15 — 2026-09-30 — Video link validation reuses `lib/url.ts` `parseHttpsUrl` instead of Zod's `z.url()`
Zod v4's `z.url()` doesn't reject userinfo (`https://user:pass@host`); `parseHttpsUrl` already does and is unit-tested, so the schema calls it via `.refine()` instead of duplicating the check.

D16 — 2026-09-30 — Floating "+" (new session) only on Journal for now
SPEC §3 puts it on Semaine and Journal, but Semaine is still a placeholder (step 8). Add it there when that step builds the real screen.

D17 — 2026-09-30 — Pain zone picker uses a native `<select>`, not chips
19 body zones as chips would dominate the screen; a `<select>` stays compact and is still a single tap on iOS.

D18 — 2026-09-30 — SessionForm reads `onValuesChange` through a ref, not as an effect dependency
The callback is an inline prop that changes identity on every parent render; depending on it directly re-fired draft autosave (and raced its own `clearSessionDraft` after submit) without any real value change. The effect now depends only on `values`; the latest callback is read from a ref kept fresh by a separate no-deps effect.

D19 — 2026-09-30 — Import orphan handling: drop when the record can't stand alone, detach when it can
A session with a missing activity, or an exercise entry with a missing session/exercise, is dropped entirely; a technique log with a missing session is only detached (text kept, mirroring invariant 2); a game-plan node with a missing technique is dropped only if `kind === 'technique'`, otherwise just loses that field. A `meta.settings`/`lastExportAt` row that fails its own schema is dropped rather than stored, so a corrupted backup can't later crash `getSettings()`.

D20 — 2026-10-01 — Quick technique creation defaults: perspective `neutral`, type `concept`, attire `both`
SPEC §4.1 says the inline picker only asks for name + position; `perspective`/`type`/`attire` are required by the schema, so they get generic defaults and stay editable later in the technique library (step 6).

D21 — 2026-10-01 — TechniqueLogs on a session are reconciled, not replaced, on save
`syncSessionTechniqueLogs(sessionId, date, drafts)` diffs the session's current logs against the form's draft list by id (create/update/delete in one transaction), so editing a session's "Techniques vues" only touches what actually changed instead of deleting and recreating every log.

D22 — 2026-10-01 — Form-level optional fields use `T | undefined` (required key), not `T?` (optional key)
With `exactOptionalPropertyTypes`, Zod's `.optional()` infers `key?: T | undefined` while a hand-written `key?: T` means "absent or T" — not the same type. Draft values round-tripped through `sessionFormValuesSchema` (autosave) must match exactly, so `SessionFormValues`/`TechniqueLogDraft` declare these fields as always-present unions (`rpe: number | undefined`, `logId: string | undefined`, …) instead of optional keys.

D23 — 2026-10-01 — `SessionForm.tsx` split into `sessionFormValues.ts` (types/schema/defaults) + `SessionBaseFields.tsx` (date/time/duration/RPE/energy)
Adding the grappling block pushed the file past 250 lines; the split keeps pure data logic separate from JSX and matches the existing per-section component pattern (`PainsField`, now `GrapplingSection`).

D24 — 2026-10-01 — Technique library filters: AND across categories, OR within a multi-select category
Selecting both "submission" and "guard_pass" types narrows to either type (OR), but combined with a perspective filter it's type-match AND perspective-match. Implemented once as a pure `filterTechniques()` in `src/domain/technique.ts`, unit-tested directly instead of through the UI. Archived techniques are excluded by default in the library list (toggle to show them) but, per invariant 5, only hidden unconditionally from pickers (`TechniquePicker`).

D25 — 2026-10-01 — Added `SafeLink` (`src/ui/SafeLink.tsx`) and `techniqueInputSchema` (`src/domain/schemas.ts`)
`SafeLink` was referenced by `.claude/rules/ui.md` for external links but didn't exist yet — first feature needing one (technique video links); it re-validates with `parseHttpsUrl` and renders nothing on failure (defense in depth). `techniqueInputSchema` mirrors the existing `sessionInputSchema` pattern (`techniqueSchema.omit({id, archived, createdAt, updatedAt})`) so the create/edit form validates through the same Zod schema the DB uses, instead of the untyped `Omit` the repo used before.

D26 — 2026-10-01 — Exercise reorder via ↑/↓ buttons, not drag-and-drop
No DnD library in the stack (D7's "fewer deps" logic); swap-with-neighbor buttons are ≥44px, keyboard/VoiceOver-friendly, and sufficient for the handful of exercises in one session.

D27 — 2026-10-01 — ExerciseEntries on a session are reconciled via `syncSessionExerciseEntries`, mirroring D21
Same diff-by-id transaction pattern as `syncSessionTechniqueLogs`: create/update/delete in one `db.transaction`, driven by the form's draft list (`entryId` present = existing).

D28 — 2026-10-01 — "Préremplir" copies the last entry's sets on tap, no auto-prefill
Auto-filling as soon as an exercise is picked risks silently overwriting a value the user already started typing (e.g. from a duplicated session). An explicit button keeps the "Dernière fois" data visible without forcing it in.

D29 — 2026-10-01 — Settings > Exercices lets you rename, archive and delete (if unreferenced), not edit metric/muscle group
SPEC §4.6 lists "add/rename/archive" for exercises; metric and muscle group are set once at creation — changing them later could silently invalidate the shape of existing ExerciseEntries' sets, so that's out of scope for v1.

D30 — 2026-10-01 — Stats: fixed per-category chart colors, independent of per-activity colors
SPEC §4.3 asks for a stacked bar by category, but colors are only defined per-activity (user-configurable) in `labels.ts`. Added a second, fixed `ActivityCategory → color` map (`activityCategoryFillClasses`/`activityCategoryDotClasses`) so the 12-week chart's legend stays stable even if the user recolors an activity.

D31 — 2026-10-01 — Stats windows are fixed (trailing 12 weeks ending this week; current month for the heatmap, navigable), no week navigation like Semaine

D32 — 2026-10-01 — Game plan editor: append-only ordering, tap-to-select row toolbar
Add child/sibling, indent and outdent always append the node at the end of its new sibling group (order = max+1), never inserting mid-list — avoids renumbering siblings and order collisions. The user repositions with ↑/↓ afterwards. Per-row edit actions (modifier, enfant, frère, déplacer, indenter, supprimer) only render once a row is tapped to select it, instead of always-visible icons, to keep the outline usable one-handed on a 375 px screen.
SPEC §4.3 doesn't specify navigation for the 12-week charts; only the calendar heatmap needs month navigation to be useful. Keeps the view simpler and matches "last 12 weeks" wording literally.

D33 — 2026-10-02 — Search: in-memory scan, highlight is case-insensitive but accent-sensitive
Matching (`domain/search.ts`) is accent/case-insensitive via `normalize()`, same as the technique filter — fast enough in-memory at personal-DB scale (2000 sessions < 200 ms, tested). The `<mark>` highlight only matches the literal substring case-insensitively (no accent folding): mapping normalized match offsets back to the original string is unreliable because NFD stripping changes string length for accented characters. Accented queries still return the right results; only the visual highlight is occasionally skipped on an accent mismatch.

D34 — 2026-10-02 — App version read from `package.json` via a Vite `define` (`__APP_VERSION__`), not a JSON import
`tsconfig.node.json` has no `resolveJsonModule`; `vite.config.ts` reads and parses the file with `node:fs` instead and injects the version as a build-time constant, declared in `src/vite-env.d.ts`. Shown on the new Settings > À propos screen alongside the iOS install steps (SPEC §4.6).

D35 — 2026-10-02 — One `UpdateToast` (`useRegisterSW`) covers both "update available" and "offline ready"
vite-plugin-pwa's hook already exposes `needRefresh` and `offlineReady` together; a single toast component satisfies both the "update prompt" and "offline check" roadmap bullets instead of a separate network-status indicator — "works in airplane mode" is verified manually on-device instead. `virtual:pwa-register/react` is mocked globally in `src/test/setup.ts` since it only resolves under Vite's dev/build pipeline, not Vitest.
