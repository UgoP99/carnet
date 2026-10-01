export * from './labels.grappling';

export const ACTIVITY_CATEGORIES = [
  'grappling',
  'strength',
  'conditioning',
  'mobility',
  'other',
] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];
export const activityCategoryLabels: Record<ActivityCategory, string> = {
  grappling: 'Grappling',
  strength: 'Renforcement',
  conditioning: 'Cardio',
  mobility: 'Mobilité',
  other: 'Autre',
};
/** Fixed per-category colors for charts (independent of per-activity user colors). Tailwind scans source for class names — no string concatenation. */
export const activityCategoryFillClasses: Record<ActivityCategory, string> = {
  grappling: 'fill-violet-500',
  strength: 'fill-sky-500',
  conditioning: 'fill-amber-500',
  mobility: 'fill-emerald-500',
  other: 'fill-slate-400',
};
export const activityCategoryDotClasses: Record<ActivityCategory, string> = {
  grappling: 'bg-violet-500',
  strength: 'bg-sky-500',
  conditioning: 'bg-amber-500',
  mobility: 'bg-emerald-500',
  other: 'bg-slate-400',
};

export const ACTIVITY_COLORS = [
  'red',
  'orange',
  'amber',
  'emerald',
  'teal',
  'sky',
  'violet',
  'slate',
] as const;
export type ActivityColor = (typeof ACTIVITY_COLORS)[number];
/** Tailwind scans source for class names — no string concatenation. */
export const activityColorClasses: Record<ActivityColor, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  slate: 'bg-slate-400',
};

export const BODY_ZONES = [
  'neck',
  'shoulder_l',
  'shoulder_r',
  'elbow_l',
  'elbow_r',
  'wrist_hand_l',
  'wrist_hand_r',
  'fingers',
  'upper_back',
  'lower_back',
  'ribs',
  'hip_l',
  'hip_r',
  'knee_l',
  'knee_r',
  'ankle_foot_l',
  'ankle_foot_r',
  'ear',
  'other',
] as const;
export type BodyZone = (typeof BODY_ZONES)[number];
export const bodyZoneLabels: Record<BodyZone, string> = {
  neck: 'Cou',
  shoulder_l: 'Épaule G',
  shoulder_r: 'Épaule D',
  elbow_l: 'Coude G',
  elbow_r: 'Coude D',
  wrist_hand_l: 'Poignet/main G',
  wrist_hand_r: 'Poignet/main D',
  fingers: 'Doigts',
  upper_back: 'Haut du dos',
  lower_back: 'Bas du dos',
  ribs: 'Côtes',
  hip_l: 'Hanche G',
  hip_r: 'Hanche D',
  knee_l: 'Genou G',
  knee_r: 'Genou D',
  ankle_foot_l: 'Cheville/pied G',
  ankle_foot_r: 'Cheville/pied D',
  ear: 'Oreille',
  other: 'Autre',
};

export const MUSCLE_GROUPS = [
  'legs',
  'push',
  'pull',
  'core',
  'full_body',
  'grip',
  'neck',
  'other',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export const muscleGroupLabels: Record<MuscleGroup, string> = {
  legs: 'Jambes',
  push: 'Poussée',
  pull: 'Tirage',
  core: 'Gainage / tronc',
  full_body: 'Corps entier',
  grip: 'Grip',
  neck: 'Cou',
  other: 'Autre',
};

export const EXERCISE_METRICS = ['weight_reps', 'reps', 'time', 'distance'] as const;
export type ExerciseMetric = (typeof EXERCISE_METRICS)[number];
export const exerciseMetricLabels: Record<ExerciseMetric, string> = {
  weight_reps: 'Charge × reps',
  reps: 'Répétitions',
  time: 'Durée',
  distance: 'Distance',
};

export const GAME_PLAN_NODE_KINDS = ['position', 'technique', 'note'] as const;
export type GamePlanNodeKind = (typeof GAME_PLAN_NODE_KINDS)[number];
export const gamePlanNodeKindLabels: Record<GamePlanNodeKind, string> = {
  position: 'Position',
  technique: 'Technique',
  note: 'Note',
};

export const RPE_LABELS: Record<number, string> = {
  1: 'Très très facile',
  2: 'Facile',
  3: 'Modéré',
  4: 'Un peu difficile',
  5: 'Difficile',
  6: '— (entre 5 et 7)',
  7: 'Très difficile',
  8: '— (entre 7 et 10)',
  9: '— (quasi maximal)',
  10: 'Maximal',
};

export const ENERGY_LABELS: Record<number, string> = {
  1: 'Épuisé',
  2: 'Fatigué',
  3: 'Normal',
  4: 'En forme',
  5: 'Excellent',
};

export const PAIN_LEVEL_LABELS: Record<number, string> = {
  1: 'Gêne',
  2: 'Douleur modérée',
  3: 'Douleur forte',
};
