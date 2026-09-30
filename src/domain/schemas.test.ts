import { describe, expect, it } from 'vitest';
import {
  activitySchema,
  backupDocSchema,
  gamePlanNodeSchema,
  gamePlanSchema,
  sessionSchema,
  settingsSchema,
  techniqueSchema,
} from './schemas';

const ts = new Date().toISOString();
const id = () => crypto.randomUUID();

describe('activitySchema', () => {
  it('accepts a valid activity', () => {
    const result = activitySchema.safeParse({
      id: id(),
      name: 'JJB',
      category: 'grappling',
      color: 'violet',
      order: 1,
      archived: false,
      createdAt: ts,
      updatedAt: ts,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown category', () => {
    const result = activitySchema.safeParse({
      id: id(),
      name: 'JJB',
      category: 'yoga',
      color: 'violet',
      order: 1,
      archived: false,
      createdAt: ts,
      updatedAt: ts,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty name', () => {
    const result = activitySchema.safeParse({
      id: id(),
      name: '',
      category: 'grappling',
      color: 'violet',
      order: 1,
      archived: false,
      createdAt: ts,
      updatedAt: ts,
    });
    expect(result.success).toBe(false);
  });
});

describe('sessionSchema', () => {
  const base = {
    id: id(),
    date: '2026-09-30',
    activityId: id(),
    durationMin: 60,
    rpe: 6,
    pains: [],
    createdAt: ts,
    updatedAt: ts,
  };

  it('accepts a minimal valid session', () => {
    expect(sessionSchema.safeParse(base).success).toBe(true);
  });

  it('accepts a grappling session with grapplingBlock', () => {
    const result = sessionSchema.safeParse({
      ...base,
      grappling: { attire: 'gi', content: ['sparring'], partners: ['Alex'] },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid date format', () => {
    expect(sessionSchema.safeParse({ ...base, date: '30-09-2026' }).success).toBe(false);
  });

  it('rejects a date with an impossible day', () => {
    expect(sessionSchema.safeParse({ ...base, date: '2026-02-30' }).success).toBe(false);
  });

  it('rejects rpe out of range', () => {
    expect(sessionSchema.safeParse({ ...base, rpe: 11 }).success).toBe(false);
  });

  it('rejects more than 10 pain entries', () => {
    const pains = Array.from({ length: 11 }, () => ({ zone: 'neck', level: 1 }));
    expect(sessionSchema.safeParse({ ...base, pains }).success).toBe(false);
  });

  it('treats an empty notes string as absent', () => {
    const result = sessionSchema.safeParse({ ...base, notes: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.notes).toBeUndefined();
  });
});

describe('techniqueSchema (video links)', () => {
  const base = {
    id: id(),
    name: 'Armbar from closed guard',
    position: 'closed_guard',
    perspective: 'bottom',
    type: 'submission',
    attire: 'both',
    tags: [],
    videoLinks: [],
    archived: false,
    createdAt: ts,
    updatedAt: ts,
  };

  it('accepts an https video link', () => {
    const result = techniqueSchema.safeParse({
      ...base,
      videoLinks: [{ url: 'https://youtube.com/watch?v=abc' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an http video link', () => {
    const result = techniqueSchema.safeParse({
      ...base,
      videoLinks: [{ url: 'http://youtube.com/watch?v=abc' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a javascript: video link', () => {
    const result = techniqueSchema.safeParse({
      ...base,
      videoLinks: [{ url: ['javascript', 'alert(1)'].join(':') }],
    });
    expect(result.success).toBe(false);
  });
});

describe('gamePlanSchema / gamePlanNodeSchema', () => {
  it('accepts a valid plan and a note node', () => {
    expect(
      gamePlanSchema.safeParse({
        id: id(),
        name: 'Top game',
        attire: 'gi',
        createdAt: ts,
        updatedAt: ts,
      }).success,
    ).toBe(true);

    expect(
      gamePlanNodeSchema.safeParse({
        id: id(),
        planId: id(),
        parentId: null,
        order: 0,
        kind: 'note',
        text: 'Start here',
        createdAt: ts,
        updatedAt: ts,
      }).success,
    ).toBe(true);
  });
});

describe('settingsSchema', () => {
  it('accepts empty goals', () => {
    expect(
      settingsSchema.safeParse({ goals: { perActivity: [] }, backupReminderDays: 14 }).success,
    ).toBe(true);
  });
});

describe('backupDocSchema', () => {
  it('accepts an empty backup document', () => {
    const result = backupDocSchema.safeParse({
      app: 'carnet',
      format: 1,
      schemaVersion: 1,
      exportedAt: ts,
      data: {
        activities: [],
        sessions: [],
        techniques: [],
        techniqueLogs: [],
        exercises: [],
        exerciseEntries: [],
        gamePlans: [],
        gamePlanNodes: [],
        meta: [],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects the wrong app name', () => {
    const result = backupDocSchema.safeParse({
      app: 'other-app',
      format: 1,
      schemaVersion: 1,
      exportedAt: ts,
      data: {
        activities: [],
        sessions: [],
        techniques: [],
        techniqueLogs: [],
        exercises: [],
        exerciseEntries: [],
        gamePlans: [],
        gamePlanNodes: [],
        meta: [],
      },
    });
    expect(result.success).toBe(false);
  });
});
