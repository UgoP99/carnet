---
paths:
  - 'src/**/*.tsx'
---

# UI rules (iPhone-first)

- Design for 375 px width, one hand: primary actions in the bottom half, tap targets ≥44 px (`min-h-11 min-w-11`), spacing ≥8 px between targets.
- Respect safe areas: `pt-[env(safe-area-inset-top)]`, `pb-[env(safe-area-inset-bottom)]` on fixed bars.
- Inputs: visible `<label>`, `inputMode="numeric"|"decimal"` for numbers, `enterKeyHint`, no zoom (≥16 px already global). Avoid hover-only affordances.
- Dark and light: always pair colors (`bg-white dark:bg-slate-900`, text contrast AA). Activity colors from the literal map in `src/domain/labels.ts`.
- User data is rendered as text only; multi-line notes with `whitespace-pre-wrap break-words`. External links: `SafeLink` component (https check + `rel="noopener noreferrer"`).
- Data access through repository hooks from `src/db/hooks.ts`; handle loading (`undefined`) and empty states.
- French copy: short, tutoiement, no jargon; numbers formatted with `Intl.NumberFormat('fr-BE')`; dates with date-fns `fr`.
- Destructive actions → `ConfirmDialog` stating what will be deleted/kept.
- Keep components < 250 lines; extract sections, not micro-components.
