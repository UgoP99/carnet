import { z } from 'zod';
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
  };
}
