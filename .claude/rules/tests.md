---
paths:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - 'src/test/**'
---

# Test rules

- Vitest globals are NOT enabled: import `describe/it/expect/vi` from `vitest`.
- Test behavior, not implementation. One behavior per `it`, French or English names are fine, be consistent per file.
- DB tests: fresh DB per test; use factories; assert invariants and transaction atomicity (simulate failure mid-transaction).
- UI tests: Testing Library queries by role/label (`getByRole`, `getByLabelText`); `userEvent` style interactions; no snapshots; no testing Tailwind classes.
- Dates: pass explicit `today`/`now` or use `vi.setSystemTime`; cover week/year boundaries.
- Keep tests fast (no real timers/sleeps). Failing output must be readable in ≤ 20 lines.
