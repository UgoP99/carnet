import { useLiveQuery } from 'dexie-react-hooks';
import type {
  Activity,
  Exercise,
  ExerciseEntry,
  GamePlan,
  GamePlanNode,
  Session,
  Settings,
  Technique,
  TechniqueLog,
} from '@/domain/schemas';
import { db } from './db';
import { getLastEntry, listEntriesForExercise, listEntriesForSession } from './exerciseEntryRepo';
import { listPlanNodes } from './gamePlanRepo';
import { getSettings } from './metaRepo';

export function useActivities(): Activity[] | undefined {
  return useLiveQuery(() => db.activities.orderBy('order').toArray(), []);
}

export function useSessions(): Session[] | undefined {
  return useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray(), []);
}

export function useSession(id: string | undefined): Session | undefined {
  return useLiveQuery(() => (id ? db.sessions.get(id) : undefined), [id]);
}

export function useTechniques(): Technique[] | undefined {
  return useLiveQuery(() => db.techniques.toArray(), []);
}

export function useTechnique(id: string | undefined): Technique | undefined {
  return useLiveQuery(() => (id ? db.techniques.get(id) : undefined), [id]);
}

export function useTechniqueLogs(): TechniqueLog[] | undefined {
  return useLiveQuery(() => db.techniqueLogs.toArray(), []);
}

export function useTechniqueLogsForTechnique(
  techniqueId: string | undefined,
): TechniqueLog[] | undefined {
  return useLiveQuery(
    () => (techniqueId ? db.techniqueLogs.where('techniqueId').equals(techniqueId).toArray() : []),
    [techniqueId],
  );
}

export function useSessionTechniqueLogs(sessionId: string | undefined): TechniqueLog[] | undefined {
  return useLiveQuery(
    () => (sessionId ? db.techniqueLogs.where('sessionId').equals(sessionId).toArray() : []),
    [sessionId],
  );
}

export function useExercises(): Exercise[] | undefined {
  return useLiveQuery(() => db.exercises.toArray(), []);
}

export function useSessionExerciseEntries(
  sessionId: string | undefined,
): ExerciseEntry[] | undefined {
  return useLiveQuery(() => (sessionId ? listEntriesForSession(sessionId) : []), [sessionId]);
}

export function useExerciseEntriesForExercise(
  exerciseId: string | undefined,
): ExerciseEntry[] | undefined {
  return useLiveQuery(() => (exerciseId ? listEntriesForExercise(exerciseId) : []), [exerciseId]);
}

export function useLastExerciseEntry(
  exerciseId: string | undefined,
  excludeSessionId: string | undefined,
): ExerciseEntry | undefined {
  return useLiveQuery(
    () => (exerciseId ? getLastEntry(exerciseId, excludeSessionId) : undefined),
    [exerciseId, excludeSessionId],
  );
}

export function useGamePlans(): GamePlan[] | undefined {
  return useLiveQuery(() => db.gamePlans.toArray(), []);
}

export function useGamePlan(id: string | undefined): GamePlan | undefined {
  return useLiveQuery(() => (id ? db.gamePlans.get(id) : undefined), [id]);
}

export function useGamePlanNodes(planId: string | undefined): GamePlanNode[] | undefined {
  return useLiveQuery(() => (planId ? listPlanNodes(planId) : []), [planId]);
}

export function useAllGamePlanNodes(): GamePlanNode[] | undefined {
  return useLiveQuery(() => db.gamePlanNodes.toArray(), []);
}

export function useLastExportAt(): string | null | undefined {
  return useLiveQuery(
    async () => (await db.meta.get('lastExportAt'))?.value as string | undefined,
    [],
    null,
  );
}

export function useSettings(): Settings | undefined {
  return useLiveQuery(() => getSettings(), []);
}
