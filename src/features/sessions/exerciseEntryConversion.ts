import type { ExerciseEntryDraft as RepoExerciseEntryDraft } from '@/db/exerciseEntryRepo';
import { setEntrySchema, type Exercise, type ExerciseEntry, type SetEntry } from '@/domain/schemas';
import type { ExerciseEntryDraft, SetDraft } from './sessionFormValues';

function toSetEntry(draft: SetDraft): SetEntry {
  return setEntrySchema.parse({
    reps: draft.reps !== '' ? Number(draft.reps) : undefined,
    weightKg: draft.weightKg !== '' ? Number(draft.weightKg) : undefined,
    durationSec: draft.durationSec !== '' ? Number(draft.durationSec) : undefined,
    distanceM: draft.distanceM !== '' ? Number(draft.distanceM) : undefined,
    rir: draft.rir !== '' ? Number(draft.rir) : undefined,
    warmup: draft.warmup,
  });
}

/** Converts UI drafts (string fields, display name) to the repo sync input, dropping empty entries. */
export function exerciseEntryDraftsToRepoInput(
  drafts: ExerciseEntryDraft[],
): RepoExerciseEntryDraft[] {
  return drafts
    .filter((draft) => draft.sets.length > 0)
    .map((draft, index) => ({
      id: draft.entryId,
      exerciseId: draft.exerciseId,
      order: index,
      sets: draft.sets.map(toSetEntry),
    }));
}

function toSetDraft(set: SetEntry): SetDraft {
  return {
    reps: set.reps !== undefined ? String(set.reps) : '',
    weightKg: set.weightKg !== undefined ? String(set.weightKg) : '',
    durationSec: set.durationSec !== undefined ? String(set.durationSec) : '',
    distanceM: set.distanceM !== undefined ? String(set.distanceM) : '',
    rir: set.rir !== undefined ? String(set.rir) : '',
    warmup: set.warmup,
  };
}

/** Converts persisted ExerciseEntries (sorted by `order`) into UI drafts for the form. */
export function exerciseEntriesToDrafts(
  entries: ExerciseEntry[],
  exercises: Exercise[],
  keepId: boolean,
): ExerciseEntryDraft[] {
  return [...entries]
    .sort((a, b) => a.order - b.order)
    .map((entry) => {
      const exercise = exercises.find((e) => e.id === entry.exerciseId);
      return {
        entryId: keepId ? entry.id : undefined,
        exerciseId: entry.exerciseId,
        exerciseName: exercise?.name ?? '?',
        metric: exercise?.metric ?? 'weight_reps',
        sets: entry.sets.map(toSetDraft),
      };
    });
}
