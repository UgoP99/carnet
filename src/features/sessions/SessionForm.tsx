import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { mostUsedActivities } from '@/domain/activityUsage';
import { ENERGY_LABELS } from '@/domain/labels';
import {
  painEntrySchema,
  sessionInputSchema,
  type Activity,
  type PainEntry,
  type Session,
  type SessionInput,
} from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { Chips } from '@/ui/Chips';
import { Field } from '@/ui/Field';
import { RpeInput } from '@/ui/RpeInput';
import { PainsField } from './PainsField';

export interface SessionFormValues {
  activityId: string;
  date: string;
  startTime: string;
  durationMin: string;
  rpe: number | undefined;
  energy: number | undefined;
  pains: PainEntry[];
  notes: string;
}

/** A Session (or partial defaults) with every property allowed to be `undefined`. */
export type SessionDefaults = { [K in keyof Session]?: Session[K] | undefined };

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
});

const DURATION_PRESETS = [45, 60, 75, 90, 120];
const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function sessionToFormValues(session: SessionDefaults, today: string): SessionFormValues {
  return {
    activityId: session.activityId ?? '',
    date: session.date ?? today,
    startTime: session.startTime ?? '',
    durationMin: session.durationMin !== undefined ? String(session.durationMin) : '',
    rpe: session.rpe,
    energy: session.energy,
    pains: session.pains ?? [],
    notes: session.notes ?? '',
  };
}

interface SessionFormProps {
  activities: Activity[];
  sessions: Session[];
  initial: SessionFormValues;
  submitLabel: string;
  onSubmit: (input: SessionInput) => Promise<void>;
  onValuesChange?: (values: SessionFormValues) => void;
}

export function SessionForm({
  activities,
  sessions,
  initial,
  submitLabel,
  onSubmit,
  onValuesChange,
}: SessionFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>();

  const topActivities = mostUsedActivities(activities, sessions, 4);
  const inTop = topActivities.some((a) => a.id === values.activityId);
  const [showOther, setShowOther] = useState(Boolean(values.activityId) && !inTop);
  const overflow = activities.filter(
    (a) => !a.archived && !topActivities.some((t) => t.id === a.id),
  );

  const onValuesChangeRef = useRef(onValuesChange);
  useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  });

  useEffect(() => {
    // Reads the ref (not the `onValuesChange` prop) so a parent re-render with a
    // new callback identity doesn't re-trigger draft autosave with stale values.
    onValuesChangeRef.current?.(values);
  }, [values]);

  function update<K extends keyof SessionFormValues>(key: K, value: SessionFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit() {
    const raw = {
      activityId: values.activityId,
      date: values.date,
      startTime: values.startTime || undefined,
      durationMin: Number(values.durationMin),
      rpe: values.rpe,
      energy: values.energy,
      pains: values.pains,
      notes: values.notes || undefined,
    };
    const result = sessionInputSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError(undefined);
    try {
      await onSubmit(result.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <Field label="Activité" htmlFor="session-activity" error={errors.activityId}>
        <div className="flex flex-col gap-2">
          <Chips
            aria-label="Activité"
            options={[
              ...topActivities.map((a) => ({ value: a.id, label: a.name })),
              { value: '__other__', label: 'Autre…' },
            ]}
            value={showOther ? ['__other__'] : values.activityId ? [values.activityId] : []}
            onChange={(v) => {
              const picked = v[0];
              if (!picked || picked === '__other__') {
                setShowOther(true);
              } else {
                setShowOther(false);
                update('activityId', picked);
              }
            }}
          />
          {showOther && (
            <Chips
              aria-label="Autres activités"
              options={overflow.map((a) => ({ value: a.id, label: a.name }))}
              value={values.activityId ? [values.activityId] : []}
              onChange={(v) => {
                update('activityId', v[0] ?? '');
              }}
            />
          )}
        </div>
      </Field>

      <Field label="Date" htmlFor="session-date" error={errors.date}>
        <input
          id="session-date"
          type="date"
          enterKeyHint="next"
          value={values.date}
          onChange={(e) => {
            update('date', e.target.value);
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Heure de début (optionnel)" htmlFor="session-start-time">
        <input
          id="session-start-time"
          type="time"
          value={values.startTime}
          onChange={(e) => {
            update('startTime', e.target.value);
          }}
          className={inputClass}
        />
      </Field>

      <Field label="Durée (min)" htmlFor="session-duration" error={errors.durationMin}>
        <div className="flex flex-col gap-2">
          <Chips
            aria-label="Durée (préréglages)"
            options={DURATION_PRESETS.map((p) => ({ value: String(p), label: String(p) }))}
            value={values.durationMin ? [values.durationMin] : []}
            onChange={(v) => {
              update('durationMin', v[0] ?? '');
            }}
          />
          <input
            id="session-duration"
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            value={values.durationMin}
            onChange={(e) => {
              update('durationMin', e.target.value);
            }}
            className={`${inputClass} w-24`}
          />
        </div>
      </Field>

      <Field label="Intensité (RPE)" htmlFor="session-rpe" error={errors.rpe}>
        <RpeInput
          value={values.rpe}
          onChange={(n) => {
            update('rpe', n);
          }}
          label="Intensité (RPE)"
        />
      </Field>

      <Field label="Énergie avant séance (optionnel)" htmlFor="session-energy">
        <Chips
          aria-label="Énergie avant séance"
          options={Object.entries(ENERGY_LABELS).map(([v, label]) => ({ value: v, label }))}
          value={values.energy !== undefined ? [String(values.energy)] : []}
          onChange={(v) => {
            update('energy', v[0] ? Number(v[0]) : undefined);
          }}
        />
      </Field>

      <PainsField
        pains={values.pains}
        onChange={(pains) => {
          update('pains', pains);
        }}
      />

      <Field label="Notes (optionnel)" htmlFor="session-notes" error={errors.notes}>
        <textarea
          id="session-notes"
          rows={3}
          value={values.notes}
          onChange={(e) => {
            update('notes', e.target.value);
          }}
          className={`${inputClass} w-full resize-none py-2`}
        />
      </Field>

      {submitError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
