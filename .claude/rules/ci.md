---
paths:
  - '.github/**'
---

# CI rules

- Pin every action to a full commit SHA with the version in a trailing comment (`uses: owner/action@<sha> # v1.2.3`).
- Workflow-level `permissions: contents: read`; grant more only per job (deploy: `pages: write`, `id-token: write`).
- `actions/checkout` with `persist-credentials: false`. Never use `pull_request_target`. No secrets are needed — don't add any.
- Install with `npm ci` (scripts disabled via `.npmrc`). Keep `npm audit --audit-level=high` in CI.
- Deploy only from `main` after all checks pass.
