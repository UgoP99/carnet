import type { LocalDate } from '@/lib/dates';
import type { ExerciseMetric } from './labels';
import type { ExerciseEntry, SetEntry } from './schemas';

/** Short human-readable summary of a set, e.g. "100kg × 5" or "45s". */
export function formatSet(set: SetEntry, metric: ExerciseMetric): string {
  switch (metric) {
    case 'weight_reps':
      return `${set.weightKg ?? 0}kg × ${set.reps ?? 0}`;
    case 'reps':
      return `${set.reps ?? 0} reps`;
    case 'time':
      return `${set.durationSec ?? 0}s`;
    case 'distance':
      return `${set.distanceM ?? 0}m`;
  }
}

/** Epley formula, rounded to 0.5 kg. Only meaningful for non-warmup sets, 1–12 reps, weight > 0. */
export function e1rm(set: SetEntry): number | null {
  if (set.warmup) return null;
  if (set.reps === undefined || set.reps < 1 || set.reps > 12) return null;
  if (set.weightKg === undefined || set.weightKg <= 0) return null;
  const raw = set.weightKg * (1 + set.reps / 30);
  return Math.round(raw * 2) / 2;
}

/**
 * The "best" set of an exercise entry, by the criterion relevant to its metric:
 * highest e1RM (weight_reps), most reps, longest duration, or longest distance.
 * Warmup sets are excluded. Returns null when no eligible set exists.
 */
export function bestSet(sets: SetEntry[], metric: ExerciseMetric): SetEntry | null {
  const eligible = sets.filter((s) => !s.warmup);
  if (eligible.length === 0) return null;

  const scored: [SetEntry, number][] = eligible
    .map((set): [SetEntry, number | null] => [set, scoreFor(set, metric)])
    .filter((entry): entry is [SetEntry, number] => entry[1] !== null);
  if (scored.length === 0) return null;

  return scored.reduce((best, current) => (current[1] > best[1] ? current : best))[0];
}

function scoreFor(set: SetEntry, metric: ExerciseMetric): number | null {
  switch (metric) {
    case 'weight_reps':
      return e1rm(set);
    case 'reps':
      return set.reps ?? null;
    case 'time':
      return set.durationSec ?? null;
    case 'distance':
      return set.distanceM ?? null;
  }
}

export interface E1rmPoint {
  date: LocalDate;
  sessionId: string;
  value: number;
}

/**
 * Best e1RM per entry (one point per session), sorted by date ascending.
 * Entries with no eligible set (no valid e1RM) are skipped.
 */
export function e1rmProgression(entries: ExerciseEntry[]): E1rmPoint[] {
  const points: E1rmPoint[] = [];
  for (const entry of entries) {
    const values = entry.sets.map(e1rm).filter((v): v is number => v !== null);
    if (values.length === 0) continue;
    points.push({ date: entry.date, sessionId: entry.sessionId, value: Math.max(...values) });
  }
  return points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
