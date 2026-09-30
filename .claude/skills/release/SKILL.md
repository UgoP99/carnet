---
name: release
description: Prepare and publish a release (version bump, changelog, tag, push → GitHub Pages deploy).
argument-hint: '[patch|minor|major]'
disable-model-invocation: true
---

Release level: `$ARGUMENTS` (default `patch`).

1. Preconditions: on `main`, clean tree, `npm run check` green, `npm audit --audit-level=high` clean. Otherwise stop and report.
2. If `src/domain/schemas.ts` or `src/db/db.ts` changed since the last tag (`git diff <lastTag> --stat`), warn: "Exporte une sauvegarde sur l'iPhone avant de mettre à jour".
3. `npm version <level> --no-git-tag-version`.
4. Update `CHANGELOG.md` (Keep a Changelog, French, user-facing wording) from `git log <lastTag>..HEAD --oneline`.
5. Commit `chore(release): vX.Y.Z`, create tag `vX.Y.Z`, then push `main` and the tag (each push needs my approval).
6. Tell me: the Actions run deploys to GitHub Pages; on the iPhone open the app → "Mise à jour disponible" → Recharger.
