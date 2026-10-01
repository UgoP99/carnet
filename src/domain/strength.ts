import type { ExerciseMetric } from './labels';
import type { SetEntry } from './schemas';

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
