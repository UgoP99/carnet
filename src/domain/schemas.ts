import { z } from 'zod';
import { parseHttpsUrl } from '@/lib/url';
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_COLORS,
  BODY_ZONES,
  EXERCISE_METRICS,
  GAME_PLAN_NODE_KINDS,
  MUSCLE_GROUPS,
} from './labels';
import {
  ATTIRES,
  PERSPECTIVES,
  POSITIONS,
  SESSION_CONTENTS,
  TECHNIQUE_ATTIRES,
  TECHNIQUE_TYPES,
} from './labels.grappling';

const id = z.uuid();
function isValidCalendarDate(s: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
const localDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide')
  .refine(isValidCalendarDate, 'Date invalide');
const timestamp = z.iso.datetime();
const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optionalTrimmed = (max: number) =>
  z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().min(1).max(max).optional());

const entityTimestamps = { createdAt: timestamp, updatedAt: timestamp };

export const activitySchema = z.object({
  id,
  name: trimmed(40),
  category: z.enum(ACTIVITY_CATEGORIES),
  color: z.enum(ACTIVITY_COLORS),
  order: z.int(),
  archived: z.boolean(),
  ...entityTimestamps,
});
export type Activity = z.infer<typeof activitySchema>;

export const painEntrySchema = z.object({
  zone: z.enum(BODY_ZONES),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});
export type PainEntry = z.infer<typeof painEntrySchema>;

export const grapplingBlockSchema = z.object({
  attire: z.enum(ATTIRES).optional(),
  content: z.array(z.enum(SESSION_CONTENTS)),
  sparringRounds: z.int().min(0).max(50).optional(),
  roundMin: z.number().min(0.5).max(30).optional(),
  subsLanded: z.int().min(0).max(99).optional(),
  subsConceded: z.int().min(0).max(99).optional(),
  partners: z.array(trimmed(40)).max(20),
});
export type GrapplingBlock = z.infer<typeof grapplingBlockSchema>;

export const sessionSchema = z.object({
  id,
  date: localDate,
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Heure invalide')
    .optional(),
  activityId: id,
  durationMin: z.int().min(1).max(600),
  rpe: z.int().min(1).max(10),
  energy: z.int().min(1).max(5).optional(),
  pains: z.array(painEntrySchema).max(10),
  notes: optionalTrimmed(10000),
  distanceKm: z.number().min(0).max(1000).optional(),
  grappling: grapplingBlockSchema.optional(),
  ...entityTimestamps,
});
export type Session = z.infer<typeof sessionSchema>;

export const sessionInputSchema = sessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type SessionInput = z.infer<typeof sessionInputSchema>;

export const techniqueSchema = z.object({
  id,
  name: trimmed(80),
  position: z.enum(POSITIONS),
  perspective: z.enum(PERSPECTIVES),
  type: z.enum(TECHNIQUE_TYPES),
  attire: z.enum(TECHNIQUE_ATTIRES),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(15),
  summary: optionalTrimmed(5000),
  videoLinks: z
    .array(
      z.object({
        url: z.string().refine((v) => parseHttpsUrl(v) !== null, 'URL https invalide'),
        label: optionalTrimmed(60),
      }),
    )
    .max(10),
  archived: z.boolean(),
  ...entityTimestamps,
});
export type Technique = z.infer<typeof techniqueSchema>;

export const techniqueInputSchema = techniqueSchema.omit({
  id: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
});
export type TechniqueInput = z.infer<typeof techniqueInputSchema>;

export const techniqueLogSchema = z.object({
  id,
  techniqueId: id,
  sessionId: id.optional(),
  date: localDate,
  text: optionalTrimmed(5000),
  ...entityTimestamps,
});
export type TechniqueLog = z.infer<typeof techniqueLogSchema>;

export const exerciseSchema = z.object({
  id,
  name: trimmed(60),
  muscleGroup: z.enum(MUSCLE_GROUPS),
  metric: z.enum(EXERCISE_METRICS),
  archived: z.boolean(),
  ...entityTimestamps,
});
export type Exercise = z.infer<typeof exerciseSchema>;

export const setEntrySchema = z.object({
  reps: z.int().min(0).max(999).optional(),
  weightKg: z.number().min(0).max(1000).multipleOf(0.25).optional(),
  durationSec: z.int().min(1).max(36000).optional(),
  distanceM: z.int().min(1).max(100000).optional(),
  rir: z.int().min(0).max(5).optional(),
  warmup: z.boolean(),
});
export type SetEntry = z.infer<typeof setEntrySchema>;

export const exerciseEntrySchema = z.object({
  id,
  sessionId: id,
  exerciseId: id,
  date: localDate,
  order: z.int(),
  note: optionalTrimmed(1000),
  sets: z.array(setEntrySchema).min(1).max(30),
  ...entityTimestamps,
});
export type ExerciseEntry = z.infer<typeof exerciseEntrySchema>;

export const gamePlanSchema = z.object({
  id,
  name: trimmed(60),
  description: optionalTrimmed(2000),
  attire: z.enum(TECHNIQUE_ATTIRES),
  ...entityTimestamps,
});
export type GamePlan = z.infer<typeof gamePlanSchema>;

export const gamePlanNodeSchema = z.object({
  id,
  planId: id,
  parentId: id.nullable(),
  order: z.int(),
  kind: z.enum(GAME_PLAN_NODE_KINDS),
  position: z.enum(POSITIONS).optional(),
  techniqueId: id.optional(),
  text: optionalTrimmed(500),
  condition: optionalTrimmed(80),
  ...entityTimestamps,
});
export type GamePlanNode = z.infer<typeof gamePlanNodeSchema>;

const perActivityGoalSchema = z.object({
  activityId: id,
  sessionsPerWeek: z.int().min(1).max(14),
});
export const settingsSchema = z.object({
  goals: z.object({
    weeklyMinutes: z.int().min(0).optional(),
    perActivity: z.array(perActivityGoalSchema),
  }),
  backupReminderDays: z.int().min(3).max(90),
});
export type Settings = z.infer<typeof settingsSchema>;

export const backupDocSchema = z.object({
  app: z.literal('carnet'),
  format: z.literal(1),
  schemaVersion: z.literal(1),
  exportedAt: timestamp,
  data: z.object({
    activities: z.array(activitySchema),
    sessions: z.array(sessionSchema),
    techniques: z.array(techniqueSchema),
    techniqueLogs: z.array(techniqueLogSchema),
    exercises: z.array(exerciseSchema),
    exerciseEntries: z.array(exerciseEntrySchema),
    gamePlans: z.array(gamePlanSchema),
    gamePlanNodes: z.array(gamePlanNodeSchema),
    meta: z.array(z.object({ key: z.string(), value: z.unknown() })),
  }),
});
export type BackupDoc = z.infer<typeof backupDocSchema>;
