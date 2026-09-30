import { newId } from '@/lib/id';
import type { ExerciseMetric, MuscleGroup } from '@/domain/labels';
import type { Activity, Exercise } from '@/domain/schemas';

const SEED_ACTIVITIES: Omit<Activity, 'id' | 'archived' | 'createdAt' | 'updatedAt'>[] = [
  { order: 1, name: 'Lutte', category: 'grappling', color: 'red' },
  { order: 2, name: 'JJB', category: 'grappling', color: 'violet' },
  { order: 3, name: 'Grappling', category: 'grappling', color: 'orange' },
  { order: 4, name: 'Préparation physique', category: 'strength', color: 'sky' },
  { order: 5, name: 'Mobilité', category: 'mobility', color: 'emerald' },
  { order: 6, name: 'Cardio', category: 'conditioning', color: 'amber' },
];

const SEED_EXERCISES: { name: string; muscleGroup: MuscleGroup; metric: ExerciseMetric }[] = [
  { name: 'Squat', muscleGroup: 'legs', metric: 'weight_reps' },
  { name: 'Front squat', muscleGroup: 'legs', metric: 'weight_reps' },
  { name: 'Soulevé de terre', muscleGroup: 'full_body', metric: 'weight_reps' },
  { name: 'Soulevé de terre roumain', muscleGroup: 'legs', metric: 'weight_reps' },
  { name: 'Hip thrust', muscleGroup: 'legs', metric: 'weight_reps' },
  { name: 'Fentes', muscleGroup: 'legs', metric: 'weight_reps' },
  { name: 'Split squat bulgare', muscleGroup: 'legs', metric: 'weight_reps' },
  { name: 'Développé couché', muscleGroup: 'push', metric: 'weight_reps' },
  { name: 'Développé militaire', muscleGroup: 'push', metric: 'weight_reps' },
  { name: 'Dips', muscleGroup: 'push', metric: 'reps' },
  { name: 'Pompes', muscleGroup: 'push', metric: 'reps' },
  { name: 'Tractions', muscleGroup: 'pull', metric: 'reps' },
  { name: 'Rowing barre', muscleGroup: 'pull', metric: 'weight_reps' },
  { name: 'Rowing haltère', muscleGroup: 'pull', metric: 'weight_reps' },
  { name: 'Tirage vertical', muscleGroup: 'pull', metric: 'weight_reps' },
  { name: 'Face pull', muscleGroup: 'pull', metric: 'weight_reps' },
  { name: 'Power clean', muscleGroup: 'full_body', metric: 'weight_reps' },
  { name: 'Kettlebell swing', muscleGroup: 'full_body', metric: 'weight_reps' },
  { name: 'Turkish get-up', muscleGroup: 'full_body', metric: 'weight_reps' },
  { name: 'Farmer walk', muscleGroup: 'grip', metric: 'distance' },
  { name: 'Suspension barre', muscleGroup: 'grip', metric: 'time' },
  { name: 'Gainage', muscleGroup: 'core', metric: 'time' },
  { name: 'Relevés de jambes', muscleGroup: 'core', metric: 'reps' },
  { name: 'Pallof press', muscleGroup: 'core', metric: 'weight_reps' },
  { name: 'Renforcement cou', muscleGroup: 'neck', metric: 'reps' },
  { name: 'Corde à sauter', muscleGroup: 'full_body', metric: 'time' },
];

export function buildSeedActivities(now: string): Activity[] {
  return SEED_ACTIVITIES.map((a) => ({
    ...a,
    id: newId(),
    archived: false,
    createdAt: now,
    updatedAt: now,
  }));
}

export function buildSeedExercises(now: string): Exercise[] {
  return SEED_EXERCISES.map((e) => ({
    ...e,
    id: newId(),
    archived: false,
    createdAt: now,
    updatedAt: now,
  }));
}
