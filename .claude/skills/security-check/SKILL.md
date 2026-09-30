---
name: security-check
description: Security review of uncommitted or branch changes against docs/SECURITY.md. Use before committing changes to import/export, URL handling, rendering of user data, CSP/PWA config, dependencies or CI workflows.
context: fork
agent: security-reviewer
background: false
---

Review the current changes of this repository for security issues.

1. Scope: `git status --short`, `git diff HEAD --stat`, then `git diff HEAD` (if on a branch other than main, also `git diff main...HEAD`). If the user passed a scope ("$ARGUMENTS", e.g. `all`), review those files instead; `all` = `src/`, `vite.config.ts`, `index.html`, `.github/`, `package.json`.
2. Read `docs/SECURITY.md` (Threats → controls, Rules for code, Review checklist) and apply the checklist to the changes.
3. If `package.json` changed: `npm audit --audit-level=moderate`, and for each new/updated dependency `npm view <pkg> time maintainers scripts --json` (age ≥7 days? install scripts? maintainers plausible?).
4. Report in French, ≤30 lines: findings by severity (Critique / Élevée / Moyenne / Faible) with `file:line`, why it matters here, concrete fix. If nothing: "Aucun problème trouvé" + the checklist items verified.
