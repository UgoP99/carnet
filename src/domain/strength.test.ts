import { describe, expect, it } from 'vitest';
import { bestSet, e1rm, e1rmProgression, formatSet } from './strength';
import type { ExerciseEntry, SetEntry } from './schemas';

const ts = new Date().toISOString();

function set(overrides: Partial<SetEntry>): SetEntry {
  return { warmup: false, ...overrides };
}

function entry(overrides: Partial<ExerciseEntry>): ExerciseEntry {
  return {
    id: 'entry-1',
    sessionId: 'session-1',
    exerciseId: 'ex-1',
    date: '2026-09-28',
    order: 0,
    sets: [set({ weightKg: 100, reps: 5 })],
    createdAt: ts,
    updatedAt: ts,
    ...overrides,
  };
}

describe('e1rm', () => {
  it('applies the Epley formula rounded to 0.5 kg', () => {
    expect(e1rm(set({ weightKg: 100, reps: 5 }))).toBe(116.5);
  });

  it('returns null for warmup sets', () => {
    expect(e1rm(set({ weightKg: 100, reps: 5, warmup: true }))).toBeNull();
  });

  it('returns null above 12 reps', () => {
    expect(e1rm(set({ weightKg: 100, reps: 13 }))).toBeNull();
  });

  it('returns null with no reps', () => {
    expect(e1rm(set({ weightKg: 100 }))).toBeNull();
  });

  it('returns null with no weight', () => {
    expect(e1rm(set({ reps: 5 }))).toBeNull();
  });

  it('returns null with weight of 0', () => {
    expect(e1rm(set({ weightKg: 0, reps: 5 }))).toBeNull();
  });
});

describe('bestSet', () => {
  it('picks the set with the highest e1RM for weight_reps', () => {
    const sets = [set({ weightKg: 80, reps: 8 }), set({ weightKg: 100, reps: 5 })];
    expect(bestSet(sets, 'weight_reps')).toEqual(sets[1]);
  });

  it('picks the set with the most reps for reps', () => {
    const sets = [set({ reps: 10 }), set({ reps: 15 })];
    expect(bestSet(sets, 'reps')).toEqual(sets[1]);
  });

  it('picks the set with the longest duration for time', () => {
    const sets = [set({ durationSec: 30 }), set({ durationSec: 60 })];
    expect(bestSet(sets, 'time')).toEqual(sets[1]);
  });

  it('picks the set with the longest distance for distance', () => {
    const sets = [set({ distanceM: 100 }), set({ distanceM: 200 })];
    expect(bestSet(sets, 'distance')).toEqual(sets[1]);
  });

  it('excludes warmup sets', () => {
    const sets = [set({ weightKg: 150, reps: 5, warmup: true }), set({ weightKg: 80, reps: 8 })];
    expect(bestSet(sets, 'weight_reps')).toEqual(sets[1]);
  });

  it('returns null when no set is eligible', () => {
    expect(bestSet([set({ warmup: true })], 'weight_reps')).toBeNull();
    expect(bestSet([], 'reps')).toBeNull();
  });
});

describe('formatSet', () => {
  it('formats a weight_reps set', () => {
    expect(formatSet(set({ weightKg: 100, reps: 5 }), 'weight_reps')).toBe('100kg × 5');
  });

  it('formats a reps set', () => {
    expect(formatSet(set({ reps: 12 }), 'reps')).toBe('12 reps');
  });

  it('formats a time set', () => {
    expect(formatSet(set({ durationSec: 45 }), 'time')).toBe('45s');
  });

  it('formats a distance set', () => {
    expect(formatSet(set({ distanceM: 200 }), 'distance')).toBe('200m');
  });
});

describe('e1rmProgression', () => {
  it('returns the best e1RM per entry, sorted by date ascending', () => {
    const entries = [
      entry({ date: '2026-09-28', sessionId: 's2', sets: [set({ weightKg: 110, reps: 5 })] }),
      entry({ date: '2026-09-14', sessionId: 's1', sets: [set({ weightKg: 100, reps: 5 })] }),
    ];
    expect(e1rmProgression(entries)).toEqual([
      { date: '2026-09-14', sessionId: 's1', value: 116.5 },
      { date: '2026-09-28', sessionId: 's2', value: 128.5 },
    ]);
  });

  it('picks the highest e1RM among several sets of the same entry', () => {
    const entries = [
      entry({
        sets: [set({ weightKg: 80, reps: 8 }), set({ weightKg: 100, reps: 5 })],
      }),
    ];
    expect(e1rmProgression(entries)[0]!.value).toBe(e1rm(set({ weightKg: 100, reps: 5 })));
  });

  it('skips entries with no eligible set', () => {
    const entries = [entry({ sets: [set({ weightKg: 100, reps: 5, warmup: true })] })];
    expect(e1rmProgression(entries)).toEqual([]);
  });

  it('returns an empty array for no entries', () => {
    expect(e1rmProgression([])).toEqual([]);
  });
});
