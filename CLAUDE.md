# Carnet — personal training log (PWA)

Offline-first PWA to log training sessions (wrestling/BJJ/grappling, strength, other sports), technique notes, weekly load and game plans. One user, iPhone Safari (installed to home screen). No backend, no account.

## Working with me

- Reply in French, concise. No recap of what you just did unless asked.
- UI text in French. Code, identifiers, comments, commits in English.
- Ask first before: adding/upgrading a dependency, changing the data model, touching CSP/PWA/CI config.

## Docs — read only what the current task needs

- `docs/ROADMAP.md` — steps + acceptance criteria. One step at a time.
- `docs/SPEC.md` — features & UX; read only the sections the step points to.
- `docs/DATA_MODEL.md` — entities, Dexie schema, invariants, backup format.
- `docs/DOMAIN.md` — sport knowledge: RPE scale, positions, technique types, e1RM, seeds, labels.
- `docs/ARCHITECTURE.md` — stack, folders, routes, patterns.
- `docs/SECURITY.md` — threat model + review checklist.
- `docs/DECISIONS.md` — append a 3-line entry for any non-obvious decision.

For broad searches use the Explore subagent. Never read `package-lock.json`, `dist/`, `node_modules/` (use `npm ls`).

## Commands

`npm run dev | test | test:watch | typecheck | lint | build | check` (`check` = everything, run before each commit).
Hooks run automatically: prettier + eslint on each edited file; typecheck + related tests when you stop. Don't re-run them by hand unless debugging.

## Stack (exact versions pinned in package.json)

React 19, TypeScript 6 (strict; do NOT upgrade to 7 — typescript-eslint needs <6.1), Vite 8, Tailwind 4, Dexie 4 + dexie-react-hooks, Zod 4, react-router 8 (HashRouter), date-fns 4, lucide-react, vite-plugin-pwa. Tests: Vitest 5, Testing Library, fake-indexeddb.

## Non-negotiables

Security

- Zero runtime network calls: no analytics, CDN, remote fonts/images. Keep CSP `connect-src 'self'`.
- Never render HTML from data (no `dangerouslySetInnerHTML`/`innerHTML`). Notes are plain text (`whitespace-pre-wrap`).
- Links: https only, via `src/lib/url.ts`; open with `rel="noopener noreferrer"`.
- Anything imported/untrusted is parsed with Zod before touching the DB.
- No secrets exist; never create `.env`. Never commit backup JSON files.
- New dependency: ask me with purpose, size, maintenance, alternatives. Version ≥7 days old, `--save-exact`.

Data

- Persistence only through repositories in `src/db/` (components use repository hooks, never `db.*`).
- Multi-table writes inside `db.transaction`. Schema changes follow the `db-migration` skill.
- Dates are local `YYYY-MM-DD` strings; weeks start Monday (ISO). IDs from `newId()` (`src/lib/id.ts`).

Quality

- Test-first for `src/domain` and `src/db`. Components: test key interactions only.
- Mobile-first 375 px: tap targets ≥44 px, input font ≥16 px, safe-area insets, dark + light.
- Files <250 lines. No speculative abstractions, no unused options.

## Workflow

1. `/next-step` → plan (≤10 lines) → implement with tests → `npm run check` → tick step in ROADMAP → propose a Conventional Commit.
2. One roadmap step per session; I run `/clear` after each commit.
3. Changes to import/export, URL handling, CSP/PWA, deps or CI → run the `security-check` skill before committing.
