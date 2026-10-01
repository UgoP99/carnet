import {
  attireLabels,
  ATTIRES,
  sessionContentLabels,
  SESSION_CONTENTS,
} from '@/domain/labels.grappling';
import type { Technique } from '@/domain/schemas';
import { Chips } from '@/ui/Chips';
import { Field } from '@/ui/Field';
import { Stepper } from '@/ui/Stepper';
import { PartnersField } from './PartnersField';
import type { GrapplingFormValues, TechniqueLogDraft } from './sessionFormValues';
import { TechniquePicker } from './TechniquePicker';

interface GrapplingSectionProps {
  value: GrapplingFormValues;
  onChange: (value: GrapplingFormValues) => void;
  techniqueLogs: TechniqueLogDraft[];
  onTechniqueLogsChange: (logs: TechniqueLogDraft[]) => void;
  techniques: Technique[];
  knownPartners: string[];
}

const inputClass =
  'min-h-11 w-24 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function GrapplingSection({
  value,
  onChange,
  techniqueLogs,
  onTechniqueLogsChange,
  techniques,
  knownPartners,
}: GrapplingSectionProps) {
  function update<K extends keyof GrapplingFormValues>(key: K, v: GrapplingFormValues[K]) {
    onChange({ ...value, [key]: v });
  }

  const sparringSelected = value.content.includes('sparring');

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <Field label="Tenue" htmlFor="grappling-attire">
        <Chips
          aria-label="Tenue"
          options={ATTIRES.map((a) => ({ value: a, label: attireLabels[a] }))}
          value={value.attire ? [value.attire] : []}
          onChange={(v) => {
            update('attire', (v[0] as GrapplingFormValues['attire']) ?? undefined);
          }}
        />
      </Field>

      <Field label="Contenu" htmlFor="grappling-content">
        <Chips
          aria-label="Contenu"
          multi
          options={SESSION_CONTENTS.map((c) => ({ value: c, label: sessionContentLabels[c] }))}
          value={value.content}
          onChange={(v) => {
            update('content', v as GrapplingFormValues['content']);
          }}
        />
      </Field>

      {sparringSelected && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Rounds de sparring
            </span>
            <Stepper
              label="rounds de sparring"
              min={0}
              max={50}
              value={value.sparringRounds ? Number(value.sparringRounds) : 0}
              onChange={(n) => {
                update('sparringRounds', n > 0 ? String(n) : '');
              }}
            />
          </div>

          <Field label="Durée d'un round (min)" htmlFor="grappling-round-min">
            <input
              id="grappling-round-min"
              type="number"
              inputMode="decimal"
              min={0.5}
              max={30}
              step={0.5}
              value={value.roundMin}
              onChange={(e) => {
                update('roundMin', e.target.value);
              }}
              className={inputClass}
            />
          </Field>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Soumissions marquées
            </span>
            <Stepper
              label="soumissions marquées"
              min={0}
              max={99}
              value={value.subsLanded}
              onChange={(n) => {
                update('subsLanded', n);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Soumissions concédées
            </span>
            <Stepper
              label="soumissions concédées"
              min={0}
              max={99}
              value={value.subsConceded}
              onChange={(n) => {
                update('subsConceded', n);
              }}
            />
          </div>

          <PartnersField
            partners={value.partners}
            knownPartners={knownPartners}
            onChange={(partners) => {
              update('partners', partners);
            }}
          />
        </div>
      )}

      <TechniquePicker
        techniques={techniques}
        logs={techniqueLogs}
        onChange={onTechniqueLogsChange}
      />
    </div>
  );
}
