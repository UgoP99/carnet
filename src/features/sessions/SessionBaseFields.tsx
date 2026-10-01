import { ENERGY_LABELS } from '@/domain/labels';
import { Chips } from '@/ui/Chips';
import { Field } from '@/ui/Field';
import { RpeInput } from '@/ui/RpeInput';
import type { SessionFormValues } from './sessionFormValues';

const DURATION_PRESETS = [45, 60, 75, 90, 120];
const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

interface SessionBaseFieldsProps {
  values: SessionFormValues;
  errors: Record<string, string>;
  update: <K extends keyof SessionFormValues>(key: K, value: SessionFormValues[K]) => void;
}

export function SessionBaseFields({ values, errors, update }: SessionBaseFieldsProps) {
  return (
    <>
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
    </>
  );
}
