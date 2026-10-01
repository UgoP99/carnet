import { z } from 'zod';
import { EXERCISE_METRICS, type ExerciseMetric } from '@/domain/labels';
import { ATTIRES, SESSION_CONTENTS } from '@/domain/labels.grappling';
import {
  painEntrySchema,
  type GrapplingBlock,
  type PainEntry,
  type Session,
} from '@/domain/schemas';

export interface GrapplingFormValues {
  attire: GrapplingBlock['attire'];
  content: GrapplingBlock['content'];
  sparringRounds: string;
  roundMin: string;
  subsLanded: number;
  subsConceded: number;
  partners: string[];
}

/** A technique attached to this session: existing (has `logId`) or newly added. */
export interface TechniqueLogDraft {
  logId: string | undefined;
  techniqueId: string;
  techniqueName: string;
  text: string;
}

/** One set being edited; numeric fields as strings so inputs can be empty. */
export interface SetDraft {
  reps: string;
  weightKg: string;
  durationSec: string;
  distanceM: string;
  rir: string;
  warmup: boolean;
}

/** An exercise attached to this session: existing (has `entryId`) or newly added. */
export interface ExerciseEntryDraft {
  entryId: string | undefined;
  exerciseId: string;
  exerciseName: string;
  metric: ExerciseMetric;
  sets: SetDraft[];
}

export interface SessionFormValues {
  activityId: string;
  date: string;
  startTime: string;
  durationMin: string;
  rpe: number | undefined;
  energy: number | undefined;
  pains: PainEntry[];
  notes: string;
  grappling: GrapplingFormValues;
  techniqueLogs: TechniqueLogDraft[];
  exerciseEntries: ExerciseEntryDraft[];
}

/** A Session (or partial defaults) with every property allowed to be `undefined`. */
export type SessionDefaults = { [K in keyof Session]?: Session[K] | undefined };

const grapplingFormValuesSchema = z.object({
  attire: z.union([z.enum(ATTIRES), z.undefined()]),
  content: z.array(z.enum(SESSION_CONTENTS)),
  sparringRounds: z.string(),
  roundMin: z.string(),
  subsLanded: z.number(),
  subsConceded: z.number(),
  partners: z.array(z.string()),
});

const techniqueLogDraftSchema = z.object({
  logId: z.union([z.string(), z.undefined()]),
  techniqueId: z.string(),
  techniqueName: z.string(),
  text: z.string(),
});

const setDraftSchema = z.object({
  reps: z.string(),
  weightKg: z.string(),
  durationSec: z.string(),
  distanceM: z.string(),
  rir: z.string(),
  warmup: z.boolean(),
});

const exerciseEntryDraftSchema = z.object({
  entryId: z.union([z.string(), z.undefined()]),
  exerciseId: z.string(),
  exerciseName: z.string(),
  metric: z.enum(EXERCISE_METRICS),
  sets: z.array(setDraftSchema),
});

/** Validates a persisted draft (raw UI state, not a Session) before it's trusted. */
export const sessionFormValuesSchema = z.object({
  activityId: z.string(),
  date: z.string(),
  startTime: z.string(),
  durationMin: z.string(),
  rpe: z.union([z.number(), z.undefined()]),
  energy: z.union([z.number(), z.undefined()]),
  pains: z.array(painEntrySchema),
  notes: z.string(),
  grappling: grapplingFormValuesSchema,
  techniqueLogs: z.array(techniqueLogDraftSchema),
  exerciseEntries: z.array(exerciseEntryDraftSchema),
});

const emptyGrappling: GrapplingFormValues = {
  attire: undefined,
  content: [],
  sparringRounds: '',
  roundMin: '',
  subsLanded: 0,
  subsConceded: 0,
  partners: [],
};

export function sessionToFormValues(
  session: SessionDefaults,
  today: string,
  techniqueLogs: TechniqueLogDraft[] = [],
  exerciseEntries: ExerciseEntryDraft[] = [],
): SessionFormValues {
  const g = session.grappling;
  return {
    activityId: session.activityId ?? '',
    date: session.date ?? today,
    startTime: session.startTime ?? '',
    durationMin: session.durationMin !== undefined ? String(session.durationMin) : '',
    rpe: session.rpe,
    energy: session.energy,
    pains: session.pains ?? [],
    notes: session.notes ?? '',
    grappling: g
      ? {
          attire: g.attire,
          content: g.content,
          sparringRounds: g.sparringRounds !== undefined ? String(g.sparringRounds) : '',
          roundMin: g.roundMin !== undefined ? String(g.roundMin) : '',
          subsLanded: g.subsLanded ?? 0,
          subsConceded: g.subsConceded ?? 0,
          partners: g.partners,
        }
      : emptyGrappling,
    techniqueLogs,
    exerciseEntries,
  };
}
