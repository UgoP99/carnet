# DOMAIN — sport knowledge, enums, French labels, seeds

Code: values + labels in `src/domain/labels.ts`; seeds in `src/db/seed.ts`.

## Intensity

**Session RPE (CR-10, Foster 2001)** — asked as "Intensité globale de la séance ?". Ideally rated ~30 min after the session.

| Value | Label (FR)        |
| ----- | ----------------- |
| 1     | Très très facile  |
| 2     | Facile            |
| 3     | Modéré            |
| 4     | Un peu difficile  |
| 5     | Difficile         |
| 6     | — (entre 5 et 7)  |
| 7     | Très difficile    |
| 8     | — (entre 7 et 10) |
| 9     | — (quasi maximal) |
| 10    | Maximal           |

**Load** = duration (min) × RPE, unit "UA" (unités arbitraires). Comparable across sports.
Do NOT display injury-risk labels (ACWR is scientifically contested — Impellizzeri et al., 2020). Show neutral trends only.

**Energy before session** (1–5): 1 Épuisé · 2 Fatigué · 3 Normal · 4 En forme · 5 Excellent.

**Pain level** (1–3): 1 Gêne · 2 Douleur modérée · 3 Douleur forte. Level 3 shows a discreet hint: "Si ça persiste, consulte un professionnel de santé."

**BodyZone** (`value` → label): `neck` Cou · `shoulder_l` Épaule G · `shoulder_r` Épaule D · `elbow_l` Coude G · `elbow_r` Coude D · `wrist_hand_l` Poignet/main G · `wrist_hand_r` Poignet/main D · `fingers` Doigts · `upper_back` Haut du dos · `lower_back` Bas du dos · `ribs` Côtes · `hip_l` Hanche G · `hip_r` Hanche D · `knee_l` Genou G · `knee_r` Genou D · `ankle_foot_l` Cheville/pied G · `ankle_foot_r` Cheville/pied D · `ear` Oreille · `other` Autre.

## Grappling

**Attire**: `gi` Gi (kimono) · `nogi` No-gi · (`both` Les deux — techniques/plans only).

**SessionContent** (multi-select): `technique` Technique · `drill` Drill · `positional` Positionnel · `sparring` Sparring · `open_mat` Open mat · `competition` Compétition.

**Position** (display order = this order; primary grouping of the library):

| value              | Label                  | Notes / typical tags                              |
| ------------------ | ---------------------- | ------------------------------------------------- |
| `standing`         | Debout                 | takedowns, clinch, hand fighting (wrestling)      |
| `front_headlock`   | Front headlock         | snap down, guillotine, go-behind                  |
| `closed_guard`     | Garde fermée           |                                                   |
| `half_guard`       | Demi-garde             | knee shield, deep half, lockdown                  |
| `open_guard`       | Garde ouverte          | tags: de-la-riva, spider, lasso, x-guard, k-guard |
| `butterfly_guard`  | Garde papillon         | single-leg-x                                      |
| `side_control`     | Contrôle latéral       | 100 kg, kesa gatame                               |
| `knee_on_belly`    | Genou sur ventre       |                                                   |
| `mount`            | Montée                 | s-mount, technical mount                          |
| `north_south`      | Nord-sud               |                                                   |
| `back`             | Dos                    | body triangle, seatbelt                           |
| `turtle`           | Tortue                 | referee's position (wrestling par terre)          |
| `leg_entanglement` | Leg entanglement       | ashi garami, 50/50, saddle (411), outside ashi    |
| `scramble`         | Transitions / scramble |                                                   |
| `other`            | Autre / concept        |                                                   |

**Perspective**: `top` Dessus · `bottom` Dessous · `neutral` Neutre (standing, scramble).

**TechniqueType**: `takedown` Amenée au sol / projection · `guard_pass` Passage de garde · `sweep` Renversement · `submission` Soumission · `escape` Sortie · `transition` Transition / contrôle · `back_take` Prise de dos · `guard_retention` Rétention de garde · `defense` Défense · `concept` Principe / concept · `drill` Drill.

Rationale: position-first grouping mirrors how grapplers think ("where am I, what can I do"); perspective disambiguates (closed guard top = passing, bottom = attacking); free tags cover sub-guards and styles without bloating the enum.

## Strength

**MuscleGroup**: `legs` Jambes · `push` Poussée · `pull` Tirage · `core` Gainage / tronc · `full_body` Corps entier · `grip` Grip · `neck` Cou · `other` Autre.

**Metric**: `weight_reps` Charge × reps · `reps` Répétitions (+ lest optionnel) · `time` Durée · `distance` Distance.

**RIR** (reps in reserve, 0–5) optional. e1RM (Epley) `w × (1 + reps/30)` for 1–12 reps, non-warmup, w > 0. Display rounded to 0.5 kg.

## Seeds

**Activities** (order, name, category, color):
1 Lutte · grappling · red — 2 JJB · grappling · violet — 3 Grappling · grappling · orange — 4 Préparation physique · strength · sky — 5 Mobilité · mobility · emerald — 6 Cardio · conditioning · amber.

**Exercises** (name · muscleGroup · metric):
Squat · legs · weight_reps — Front squat · legs · weight_reps — Soulevé de terre · full_body · weight_reps — Soulevé de terre roumain · legs · weight_reps — Hip thrust · legs · weight_reps — Fentes · legs · weight_reps — Split squat bulgare · legs · weight_reps — Développé couché · push · weight_reps — Développé militaire · push · weight_reps — Dips · push · reps — Pompes · push · reps — Tractions · pull · reps — Rowing barre · pull · weight_reps — Rowing haltère · pull · weight_reps — Tirage vertical · pull · weight_reps — Face pull · pull · weight_reps — Power clean · full_body · weight_reps — Kettlebell swing · full_body · weight_reps — Turkish get-up · full_body · weight_reps — Farmer walk · grip · distance — Suspension barre · grip · time — Gainage · core · time — Relevés de jambes · core · reps — Pallof press · core · weight_reps — Renforcement cou · neck · reps — Corde à sauter · full_body · time.

## Activity colors

Tailwind mapping (dot/bar backgrounds must reach 3:1 contrast on both themes): red `bg-red-500`, orange `bg-orange-500`, amber `bg-amber-500`, emerald `bg-emerald-500`, teal `bg-teal-500`, sky `bg-sky-500`, violet `bg-violet-500`, slate `bg-slate-400`. Write class names literally in a map (Tailwind scans source; no string concatenation).
