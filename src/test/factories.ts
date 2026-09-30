import { newId } from '@/lib/id';
import type {
  Activity,
  Exercise,
  ExerciseEntry,
  GamePlan,
  GamePlanNode,
  Session,
  SetEntry,
  Technique,
  TechniqueLog,
} from '@/domain/schemas';

const now = () => new Date().toISOString();

export function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: newId(),
    name: 'JJB',
    category: 'grappling',
    color: 'violet',
    order: 1,
    archived: false,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: newId(),
    date: '2026-09-28',
    activityId: newId(),
    durationMin: 60,
    rpe: 6,
    pains: [],
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeTechnique(overrides: Partial<Technique> = {}): Technique {
  return {
    id: newId(),
    name: 'Armbar from closed guard',
    position: 'closed_guard',
    perspective: 'bottom',
    type: 'submission',
    attire: 'both',
    tags: [],
    videoLinks: [],
    archived: false,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeTechniqueLog(overrides: Partial<TechniqueLog> = {}): TechniqueLog {
  return {
    id: newId(),
    techniqueId: newId(),
    date: '2026-09-28',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: newId(),
    name: 'Squat',
    muscleGroup: 'legs',
    metric: 'weight_reps',
    archived: false,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeSetEntry(overrides: Partial<SetEntry> = {}): SetEntry {
  return { reps: 5, weightKg: 100, warmup: false, ...overrides };
}

export function makeExerciseEntry(overrides: Partial<ExerciseEntry> = {}): ExerciseEntry {
  return {
    id: newId(),
    sessionId: newId(),
    exerciseId: newId(),
    date: '2026-09-28',
    order: 0,
    sets: [makeSetEntry()],
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeGamePlan(overrides: Partial<GamePlan> = {}): GamePlan {
  return {
    id: newId(),
    name: 'Top game',
    attire: 'gi',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function makeGamePlanNode(overrides: Partial<GamePlanNode> = {}): GamePlanNode {
  return {
    id: newId(),
    planId: newId(),
    parentId: null,
    order: 0,
    kind: 'note',
    text: 'Start here',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}
