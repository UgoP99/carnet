# SPEC — Carnet v1

## 1. Vision

A private training journal on the iPhone. Right after a session (locker room, tired, one hand), log what happened in ≤30 s, and later find back the important technical details. Multisport: grappling is first-class, but strength & conditioning, mobility, cardio and any custom activity are handled.

Inspirations (keep what works):

- BJJ technique journals: notes grouped by topic/position, "search everything", no account, data stays on device.
- BJJNote-style logs: sessions + time/intensity statistics.
- Flowchart/game-plan apps: connect techniques into a game plan.
- Strong/Hevy: structured strength logging, "previous" values prefilled from last time.
- Sports science: session-RPE load (Foster) for comparable intensity across sports.

## 2. Principles

1. **Speed of capture** over completeness: every field optional except activity, date, duration, RPE. Sensible defaults (today, last activity, last duration).
2. **Offline & private**: works in airplane mode; nothing leaves the phone except explicit exports.
3. **Knowledge accumulates**: technique details from all sessions converge on the technique page.
4. **Calm UI**: no streaks, badges, or guilt. Neutral numbers.
5. **Never lose data**: draft autosave, backups with reminders, confirm destructive actions.

## 3. Navigation

Bottom tab bar (5): **Semaine** (home) · **Journal** · **Techniques** · **Plans** · **Réglages**.
Header: search icon (global search), contextual actions. Floating "+" button on Semaine and Journal → new session.
All screens usable at 375 px width, one-handed; primary actions in the bottom half.

## 4. Features

### 4.1 Session logging (step 3, 5, 7)

Form "Nouvelle séance" — one scrollable screen, sections collapsed when irrelevant:

- **Base** (always): activity (chips of the 4 most-used + "Autre…"), date (default today), start time (optional), duration (presets 45/60/75/90/120 + custom), **RPE 1–10** (large slider/segmented control with CR-10 labels, see DOMAIN), energy before session 1–5 (optional), pains (optional: body zone + level 1–3, several), notes (free text, autosize).
- **Grappling block** (shown when activity category = grappling):
  - Attire: Gi / No-gi.
  - Content (multi-select chips — a class usually mixes several): Technique, Drill, Positionnel, Sparring, Open mat, Compétition.
  - Sparring: rounds count, round duration; submissions placed / conceded (+/− counters); partners (free-text chips, autocomplete from history).
  - **Techniques vues**: search-or-create picker (create inline with name + position only), each with an optional detail text ("détail important"). Stored as TechniqueLog.
- **Strength block** (category = strength): list of exercises; each exercise has sets (reps × kg, or reps, time, distance per exercise metric), warm-up flag, optional RIR. When adding an exercise, show **"Dernière fois : …"** and prefill sets from the previous entry of that exercise. Reorder exercises, add/remove sets fast.
- **Conditioning**: optional distance (km).
- Draft autosave on every change (restored if app was killed). "Enregistrer" validates with Zod and shows inline errors.
- Session actions: edit, delete (confirm; technique logs are kept and detached), **duplicate** ("Refaire cette séance": copies activity, duration, grappling settings or exercises with last values; date = today).

Journal: sessions grouped by week (newest first), each row: activity color dot, name, date, duration, RPE, load, first line of notes. Filter by activity. Infinite scroll / paging by 20.

Session detail: all fields read-only, technique links, exercise table with e1RM per set.

### 4.2 Technique library (step 5, 6)

- List grouped by **position** (primary), then type; filters: type, perspective (dessus/dessous), gi/no-gi, tags; text search.
- Technique page: name, position, perspective, type, attire, tags, summary ("points clés"), video links (https only, open externally), and the **timeline of all details** logged in sessions (date + session link + text) plus standalone notes ("Ajouter une note").
- Create/edit/archive. Deleting allowed only if unreferenced (else archive).
- Counters: times seen, last seen date.

### 4.3 Week & trends (step 8, 9)

Home "Semaine" (ISO week, Monday start, ‹ › navigation, "Aujourd'hui"):

- 7-day strip: per day, colored dots per session (activity color); tap a day → its sessions.
- Totals: sessions, minutes, load (UA); breakdown by activity (minutes + sessions).
- Goals progress (if set): weekly minutes and sessions per activity (progress bars, neutral wording).
- Trend: this week's load vs average of the 4 previous weeks, shown as a neutral % ("+12 % vs moyenne 4 sem."). No injury-risk labels.
- Backup reminder banner if last export older than the configured threshold.

Stats screen (from Semaine): last 12 weeks stacked bar chart of load by category (SVG, no chart lib); minutes per activity over 12 weeks; month calendar heatmap of daily load; per-exercise progression (best e1RM per session, line chart).

### 4.4 Game plans (step 10)

A game plan is a tree (outline), mobile-friendly:

- Node kinds: **position** (from the position list), **technique** (from the library), **note**.
- Each child can carry a **condition** label (e.g. "s'il sprawl", "s'il pousse mon genou").
- Example: Debout → Double leg → (s'il sprawl) Snap down → Dos.
- Editor: add child/sibling, edit, reorder (up/down), indent/outdent, delete subtree (confirm), collapse/expand. Tap a technique node → technique page.
- Plans list with name, attire, node count. Max depth 8.

### 4.5 Search (step 11)

Single field; results grouped: sessions (notes, partners), techniques (name, tags, summary), technique details (log text), plans. Accent- and case-insensitive. Highlight is plain-text (no HTML).

### 4.6 Settings & data (step 4, 8, 12)

- Activities: add/rename/recolor/reorder/archive; category required.
- Exercises: add/rename/archive; metric + muscle group.
- Goals (optional): weekly minutes; sessions/week per activity.
- **Sauvegarde**: export JSON (iOS share sheet → Fichiers/iCloud Drive; fallback download), import JSON (validate, preview counts, mode Remplacer ou Fusionner), last export date, reminder threshold (default 14 days).
- Storage: request persistent storage; show persisted status and usage estimate.
- About: version, link to install instructions, "données stockées uniquement sur cet appareil".

## 5. Non-functional

- iOS Safari 17+ installed as home-screen app; also works in desktop browsers.
- Initial JS ≤ 300 kB gzip; lazy-load Stats and Plans routes. Interaction feedback < 100 ms.
- Accessibility: semantic elements, labels on every input, visible focus, contrast AA, respects reduced motion.
- French UI; dates formatted `fr-BE` (e.g. "lun. 29 sept.").

## 6. Out of scope for v1 (backlog v2)

- Techniques "À essayer cette semaine" (1–3 flagged) and sparring outcome per attempt (Réussi / Presque / Raté).
- Spaced review queue of important details (3 d → 1 w → 1 m).
- Competitions (countdown, weight target, results), belt & stripes history, bodyweight tracking.
- Rest timer, workout templates/routines, PR notifications.
- Photos/videos stored in app. Voice notes.
- Monotony/strain metrics. Graph view of game plans.
- Multi-device sync (would require backend + auth + E2E encryption — separate security design).
- Notifications/reminders after training (limited on iOS PWAs).
