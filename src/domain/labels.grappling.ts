export const SESSION_CONTENTS = [
  'technique',
  'drill',
  'positional',
  'sparring',
  'open_mat',
  'competition',
] as const;
export type SessionContent = (typeof SESSION_CONTENTS)[number];
export const sessionContentLabels: Record<SessionContent, string> = {
  technique: 'Technique',
  drill: 'Drill',
  positional: 'Positionnel',
  sparring: 'Sparring',
  open_mat: 'Open mat',
  competition: 'Compétition',
};

export const ATTIRES = ['gi', 'nogi'] as const;
export type Attire = (typeof ATTIRES)[number];
export const attireLabels: Record<Attire, string> = { gi: 'Gi', nogi: 'No-gi' };

export const TECHNIQUE_ATTIRES = ['gi', 'nogi', 'both'] as const;
export type TechniqueAttire = (typeof TECHNIQUE_ATTIRES)[number];
export const techniqueAttireLabels: Record<TechniqueAttire, string> = {
  gi: 'Gi',
  nogi: 'No-gi',
  both: 'Les deux',
};

export const POSITIONS = [
  'standing',
  'front_headlock',
  'closed_guard',
  'half_guard',
  'open_guard',
  'butterfly_guard',
  'side_control',
  'knee_on_belly',
  'mount',
  'north_south',
  'back',
  'turtle',
  'leg_entanglement',
  'scramble',
  'other',
] as const;
export type Position = (typeof POSITIONS)[number];
export const positionLabels: Record<Position, string> = {
  standing: 'Debout',
  front_headlock: 'Front headlock',
  closed_guard: 'Garde fermée',
  half_guard: 'Demi-garde',
  open_guard: 'Garde ouverte',
  butterfly_guard: 'Garde papillon',
  side_control: 'Contrôle latéral',
  knee_on_belly: 'Genou sur ventre',
  mount: 'Montée',
  north_south: 'Nord-sud',
  back: 'Dos',
  turtle: 'Tortue',
  leg_entanglement: 'Leg entanglement',
  scramble: 'Transitions / scramble',
  other: 'Autre / concept',
};

export const PERSPECTIVES = ['top', 'bottom', 'neutral'] as const;
export type Perspective = (typeof PERSPECTIVES)[number];
export const perspectiveLabels: Record<Perspective, string> = {
  top: 'Dessus',
  bottom: 'Dessous',
  neutral: 'Neutre',
};

export const TECHNIQUE_TYPES = [
  'takedown',
  'guard_pass',
  'sweep',
  'submission',
  'escape',
  'transition',
  'back_take',
  'guard_retention',
  'defense',
  'concept',
  'drill',
] as const;
export type TechniqueType = (typeof TECHNIQUE_TYPES)[number];
export const techniqueTypeLabels: Record<TechniqueType, string> = {
  takedown: 'Amenée au sol / projection',
  guard_pass: 'Passage de garde',
  sweep: 'Renversement',
  submission: 'Soumission',
  escape: 'Sortie',
  transition: 'Transition / contrôle',
  back_take: 'Prise de dos',
  guard_retention: 'Rétention de garde',
  defense: 'Défense',
  concept: 'Principe / concept',
  drill: 'Drill',
};
