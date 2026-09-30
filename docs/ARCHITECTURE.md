# ARCHITECTURE

## Overview

Static SPA (Vite build) served by GitHub Pages, installed as a PWA on iPhone. All data in IndexedDB (Dexie) on the device. Service worker precaches the app shell → fully offline. No server, no auth, no runtime network.

```
UI (routes/features)  →  hooks (useLiveQuery wrappers)  →  repositories (src/db/*)  →  Dexie / IndexedDB
            ↘ pure domain logic (src/domain: schemas, calculations, labels) ↙
```

## Folders

```
src/
  main.tsx, App.tsx          entry, router, layout, SW registration
  app/                       Layout (tab bar, header, safe areas), routes.tsx, NotFound
  domain/                    schemas.ts (Zod = source of truth), labels.ts, load.ts, week.ts, strength.ts — pure, no Dexie/React
  db/                        db.ts (Dexie schema), seed.ts, <entity>Repo.ts, backup.ts, migrations.ts, hooks.ts
  features/
    sessions/                SessionForm, GrapplingSection, StrengthSection, SessionList, SessionDetail
    week/                    WeekView, WeekStrip, GoalsProgress
    stats/                   StatsView, LoadChart, CalendarHeatmap, ExerciseProgress (lazy)
    techniques/              TechniqueList, TechniqueDetail, TechniqueForm, TechniquePicker
    gameplans/               PlanList, PlanEditor (lazy)
    search/                  SearchView
    settings/                Settings, Activities, Exercises, Goals, Backup, Storage
  ui/                        Button, Field, Chips, Segmented, RpeInput, Stepper, Sheet, ConfirmDialog, EmptyState
  lib/                       id.ts, dates.ts, text.ts (normalize for search), url.ts, share.ts (export file)
  test/                      setup.ts, factories.ts
```

Tests are colocated: `foo.ts` → `foo.test.ts`.

## Routing (react-router 8, `HashRouter` — works on GitHub Pages without 404 hacks)

| Path                                                                        | Screen                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `/`                                                                         | Semaine (`?w=2026-W40`)                                         |
| `/journal`                                                                  | Session list (`?activity=<id>`)                                 |
| `/sessions/new`                                                             | New session (`?activity=&date=&from=<sessionId>` for duplicate) |
| `/sessions/:id`, `/sessions/:id/edit`                                       | Detail / edit                                                   |
| `/techniques`, `/techniques/new`, `/techniques/:id`, `/techniques/:id/edit` | Library                                                         |
| `/plans`, `/plans/:id`                                                      | Game plans                                                      |
| `/stats`                                                                    | Trends (lazy)                                                   |
| `/search`                                                                   | Global search (`?q=`)                                           |
| `/settings`, `/settings/{activities,exercises,goals,backup}`                | Settings                                                        |

## Patterns

- **Reads**: `useLiveQuery` inside repository hooks (`useWeekSessions(weekKey)`, `useTechnique(id)`), so the UI updates after any write. Handle `undefined` (loading) explicitly.
- **Writes**: repository functions (`createSession(input)`) that parse input with Zod, set ids/timestamps, enforce invariants, use `db.transaction('rw', …)` for multi-table writes. They throw typed errors; UI shows a French message.
- **Forms**: controlled React state + `schema.safeParse` on submit; map Zod issues to fields. No form library.
- **State**: no global store. URL params for navigation state; Dexie for data; component state for UI.
- **Styling**: Tailwind utility classes; small `ui/` primitives; dark mode via `prefers-color-scheme` (`dark:` variant); activity color map written literally.
- **Dates**: `date-fns` with `fr` locale for display; helpers in `lib/dates.ts` (`todayLocal()`, `isoWeekKey()`, `weekRange()`), never `new Date('YYYY-MM-DD')` (UTC parsing bug) — use `parseISO` from date-fns.
- **Errors**: an app-level error boundary with "Exporter mes données" fallback button (data first).
- **Code splitting**: `React.lazy` for Stats and Plans.

## PWA & storage

- `vite-plugin-pwa` generateSW, `registerType: 'prompt'`: show "Mise à jour disponible — Recharger" toast via `useRegisterSW` (step 12).
- Precache app shell only. No runtime caching of external resources (there are none).
- On first launch and in Settings: `navigator.storage.persist()`; show status + `navigator.storage.estimate()`.
- iOS: data belongs to the installed home-screen app origin; changing the deploy URL = new empty database → export first.

## Build, CI, deploy

- `npm run check` locally = format check, typecheck, lint, tests, build.
- GitHub Actions `ci.yml`: same checks + `npm audit --audit-level=high` on every push/PR; on `main` builds with `BASE_PATH=/<repo>/` and deploys to GitHub Pages.
- `codeql.yml`: CodeQL (JS/TS + Actions) weekly and on PRs. Dependabot weekly with 7-day cooldown.

## Testing strategy

- `src/domain`: exhaustive unit tests (edge cases: week boundaries, DST, empty data).
- `src/db`: repository tests against fake-indexeddb (fresh DB per test: `await db.delete(); await db.open()`), invariants and transactions, backup round-trip (export → import = same data) and malicious inputs.
- UI: Testing Library for key flows (create session, pick technique, import preview). No snapshot tests.
- Manual on iPhone before each release: install, offline mode, export via share sheet, import.
