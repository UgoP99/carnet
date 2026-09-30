---
name: next-step
description: Implement the next unchecked step of docs/ROADMAP.md (or the given step number) with TDD, checks and a commit proposal.
argument-hint: '[step-number]'
disable-model-invocation: true
---

Target: step `$ARGUMENTS` of `docs/ROADMAP.md`, or the first `### [ ]` step if no argument.

1. Read only that step, then only the doc sections listed in its "Read" line.
2. Ambiguity or conflict with the docs → ask me (≤3 questions) before coding.
3. Post a plan: ≤10 lines, files to create/change. Wait for my OK only if the step changes the data model, dependencies, CSP/PWA or CI; otherwise proceed.
4. Implement in small increments; test-first for `src/domain` and `src/db`.
5. Run `npm run check`; fix until green.
6. Check each "Done when" criterion; list the ones that need a manual check (e.g. on iPhone) with how to verify.
7. Tick the step (`### [x]`) in `docs/ROADMAP.md`. Non-obvious choice → append an entry to `docs/DECISIONS.md`.
8. Step touched import/export, URLs, CSP/PWA, deps or CI → run the `security-check` skill and fix findings.
9. `git add` the changes, propose a Conventional Commit message, commit after my OK. Then tell me to run `/clear`.
