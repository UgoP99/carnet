import { useEffect, useRef, useState } from 'react';
import { mostUsedActivities } from '@/domain/activityUsage';
import {
  sessionInputSchema,
  type Activity,
  type Session,
  type SessionInput,
  type Technique,
} from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { Chips } from '@/ui/Chips';
import { Field } from '@/ui/Field';
import { GrapplingSection } from './GrapplingSection';
import { PainsField } from './PainsField';
import { SessionBaseFields } from './SessionBaseFields';
import type { SessionFormValues, TechniqueLogDraft } from './sessionFormValues';

export { sessionFormValuesSchema, sessionToFormValues } from './sessionFormValues';
export type {
  GrapplingFormValues,
  SessionDefaults,
  SessionFormValues,
  TechniqueLogDraft,
} from './sessionFormValues';

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

interface SessionFormProps {
  activities: Activity[];
  sessions: Session[];
  techniques: Technique[];
  initial: SessionFormValues;
  submitLabel: string;
  onSubmit: (input: SessionInput, techniqueLogs: TechniqueLogDraft[]) => Promise<void>;
  onValuesChange?: (values: SessionFormValues) => void;
}

export function SessionForm({
  activities,
  sessions,
  techniques,
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

  const isGrappling = activities.find((a) => a.id === values.activityId)?.category === 'grappling';
  const knownPartners = Array.from(
    new Set(sessions.flatMap((s) => s.grappling?.partners ?? [])),
  ).sort((a, b) => a.localeCompare(b, 'fr'));

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
      grappling: isGrappling
        ? {
            attire: values.grappling.attire,
            content: values.grappling.content,
            sparringRounds: values.grappling.sparringRounds
              ? Number(values.grappling.sparringRounds)
              : undefined,
            roundMin: values.grappling.roundMin ? Number(values.grappling.roundMin) : undefined,
            subsLanded: values.grappling.subsLanded,
            subsConceded: values.grappling.subsConceded,
            partners: values.grappling.partners,
          }
        : undefined,
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
      await onSubmit(result.data, isGrappling ? values.techniqueLogs : []);
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

      <SessionBaseFields values={values} errors={errors} update={update} />

      <PainsField
        pains={values.pains}
        onChange={(pains) => {
          update('pains', pains);
        }}
      />

      {isGrappling && (
        <GrapplingSection
          value={values.grappling}
          onChange={(grappling) => {
            update('grappling', grappling);
          }}
          techniqueLogs={values.techniqueLogs}
          onTechniqueLogsChange={(techniqueLogs) => {
            update('techniqueLogs', techniqueLogs);
          }}
          techniques={techniques}
          knownPartners={knownPartners}
        />
      )}

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
