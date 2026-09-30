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
