# SECURITY

## Context

Single-user, offline-first PWA. No backend, no accounts, no secrets. Data (training notes, pains = health-related data) lives in IndexedDB on the user's iPhone and in backup files the user exports. The source code repo is public (GitHub Pages free tier) and contains no personal data.

## Assets

1. Personal data in IndexedDB and in exported backups (confidentiality, integrity, availability).
2. Integrity of the deployed app (what code runs on the phone).
3. The developer's GitHub account and the CI pipeline (they control #2).

## Threats → controls

| Threat                                                          | Controls                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| XSS via stored notes, technique names, imported JSON            | React text rendering only; ESLint bans `dangerouslySetInnerHTML`/`innerHTML`/`insertAdjacentHTML`/`eval`/`new Function`; strict CSP (`script-src 'self'`, no `unsafe-inline/eval`).                                                                                                                        |
| `javascript:`/`data:` URLs in video links                       | `lib/url.ts`: parse with `new URL()`, accept only `https:`; reject credentials in URL; links `target="_blank" rel="noopener noreferrer"`; ESLint `no-script-url`.                                                                                                                                          |
| Data exfiltration by a compromised dependency                   | CSP `connect-src 'self'` + no external resources → the browser blocks outbound requests; few deps; exact versions; lockfile; `npm ci`.                                                                                                                                                                     |
| Malicious npm package (install scripts, fresh hijacked release) | `.npmrc ignore-scripts=true`; new versions only if ≥7 days old (Dependabot `cooldown`, `npm install --before=<date>`); review each new dep (maintainers, downloads, size, scripts); `npm audit` in CI.                                                                                                     |
| Malicious/corrupted import file                                 | Size cap 25 MB; `JSON.parse` in try/catch; full Zod validation (unknown keys stripped, string lengths and array sizes bounded); version check; referential check; preview before commit; single transaction (all-or-nothing); never spread untrusted objects into records — build them from parsed fields. |
| Data loss (iOS storage eviction, app deleted, bug)              | Installed home-screen app; `navigator.storage.persist()`; export reminders; draft autosave; transactions; migrations tested; error boundary with export button.                                                                                                                                            |
| Compromised CI / supply chain of Actions                        | Actions pinned to full commit SHA; `permissions:` least privilege per job; `persist-credentials: false`; deploy job only on `main`; no secrets used; CodeQL on JS/TS + workflows.                                                                                                                          |
| GitHub account takeover → malicious deploy                      | 2FA (passkey or TOTP) on GitHub; secret scanning & Dependabot alerts on; review Dependabot PRs before merging (no auto-merge).                                                                                                                                                                             |
| Shared origin `<user>.github.io`                                | All project Pages of one account share the origin (and thus IndexedDB). Don't host other untrusted pages on this account's Pages, or move to a custom domain/other host later.                                                                                                                             |
| Backup file leakage                                             | Backups contain health-related notes: store them in a private location (iCloud Drive/Files), never in the repo (`.gitignore`), never share. Claude Code is denied reading `*backup*.json`.                                                                                                                 |
| Device theft                                                    | Out of app scope: rely on iPhone passcode/Face ID. (Optional v2: app lock.)                                                                                                                                                                                                                                |
| Claude Code acting unsafely                                     | `.claude/settings.json`: deny secrets/backup reads, `curl/wget`, force-push, publish; ask for installs, pushes, CI/config edits; hooks enforce lint/tests.                                                                                                                                                 |

## Rules for code

- No `fetch`/XHR/WebSocket/beacon, no third-party scripts, fonts, images or iframes. System font stack.
- Render user data as text only. Highlighting in search = split text into React nodes, never HTML.
- All external input (import, URL fields, query params) validated with Zod or `lib/url.ts`.
- Don't log personal data to the console in production code.
- No `localStorage`/`sessionStorage` (ESLint-enforced); everything in Dexie.
- Keep CSP in `vite.config.ts` unchanged unless reviewed (ask first).

## Review checklist (used by the `security-check` skill)

1. Any new HTML sink, `eval`-like API, or bypass of the ESLint security rules (`eslint-disable`)?
2. Any new network access, external resource, or CSP change?
3. URLs from user data go through `lib/url.ts` and open with `noopener noreferrer`?
4. Import/backup code: size cap, Zod parse, version check, transaction, no untrusted spread, round-trip test, malicious-input tests (wrong types, huge strings, `__proto__` keys, orphans, future versions)?
5. New/updated dependencies: necessary? ≥7 days old? install scripts? maintainers/downloads OK? `npm audit` clean?
6. CI changes: actions pinned by SHA, minimal permissions, no secrets, no `pull_request_target`?
7. Personal data never logged, never committed, never sent anywhere?
8. Destructive operations confirmed and transactional?

## If something goes wrong

- Suspicious dependency/advisory: stop deploying (disable the workflow), pin/revert, `npm audit`, rotate nothing (no secrets exist), redeploy.
- Account compromise: revoke sessions/tokens, re-secure 2FA, inspect recent commits and workflow runs, redeploy from a known-good commit. Users' data is on the phone; only code integrity is at stake.
