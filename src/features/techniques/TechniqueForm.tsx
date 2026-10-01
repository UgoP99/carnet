import { useState } from 'react';
import {
  PERSPECTIVES,
  perspectiveLabels,
  POSITIONS,
  positionLabels,
  TECHNIQUE_ATTIRES,
  techniqueAttireLabels,
  TECHNIQUE_TYPES,
  techniqueTypeLabels,
  type Perspective,
  type Position,
  type TechniqueAttire,
  type TechniqueType,
} from '@/domain/labels.grappling';
import { techniqueInputSchema, type Technique, type TechniqueInput } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';
import { TagsField } from './TagsField';
import { VideoLinksField, type VideoLinkValue } from './VideoLinksField';

export interface TechniqueFormValues {
  name: string;
  position: Position;
  perspective: Perspective;
  type: TechniqueType;
  attire: TechniqueAttire;
  tags: string[];
  summary: string;
  videoLinks: VideoLinkValue[];
}

export function techniqueToFormValues(technique: Technique): TechniqueFormValues {
  return {
    name: technique.name,
    position: technique.position,
    perspective: technique.perspective,
    type: technique.type,
    attire: technique.attire,
    tags: technique.tags,
    summary: technique.summary ?? '',
    videoLinks: technique.videoLinks.map((l) => ({ url: l.url, label: l.label ?? '' })),
  };
}

export const DEFAULT_TECHNIQUE_FORM_VALUES: TechniqueFormValues = {
  name: '',
  position: 'standing',
  perspective: 'neutral',
  type: 'concept',
  attire: 'both',
  tags: [],
  summary: '',
  videoLinks: [],
};

interface TechniqueFormProps {
  initial: TechniqueFormValues;
  submitLabel: string;
  onSubmit: (input: TechniqueInput) => Promise<void>;
}

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function TechniqueForm({ initial, submitLabel, onSubmit }: TechniqueFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>();

  function update<K extends keyof TechniqueFormValues>(key: K, value: TechniqueFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit() {
    const raw = {
      name: values.name,
      position: values.position,
      perspective: values.perspective,
      type: values.type,
      attire: values.attire,
      tags: values.tags,
      summary: values.summary || undefined,
      videoLinks: values.videoLinks.map((l) => ({ url: l.url, label: l.label || undefined })),
    };
    const result = techniqueInputSchema.safeParse(raw);
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
      <Field label="Nom" htmlFor="technique-name" error={errors.name}>
        <input
          id="technique-name"
          type="text"
          value={values.name}
          onChange={(e) => {
            update('name', e.target.value);
          }}
          className={`${inputClass} w-full`}
        />
      </Field>

      <Field label="Position" htmlFor="technique-position" error={errors.position}>
        <select
          id="technique-position"
          value={values.position}
          onChange={(e) => {
            update('position', e.target.value as Position);
          }}
          className={`${inputClass} w-full`}
        >
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {positionLabels[p]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Perspective" htmlFor="technique-perspective" error={errors.perspective}>
        <Segmented
          aria-label="Perspective"
          options={PERSPECTIVES.map((p) => ({ value: p, label: perspectiveLabels[p] }))}
          value={values.perspective}
          onChange={(v) => {
            update('perspective', v as Perspective);
          }}
        />
      </Field>

      <Field label="Type" htmlFor="technique-type" error={errors.type}>
        <select
          id="technique-type"
          value={values.type}
          onChange={(e) => {
            update('type', e.target.value as TechniqueType);
          }}
          className={`${inputClass} w-full`}
        >
          {TECHNIQUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {techniqueTypeLabels[t]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tenue" htmlFor="technique-attire" error={errors.attire}>
        <Segmented
          aria-label="Tenue"
          options={TECHNIQUE_ATTIRES.map((a) => ({ value: a, label: techniqueAttireLabels[a] }))}
          value={values.attire}
          onChange={(v) => {
            update('attire', v as TechniqueAttire);
          }}
        />
      </Field>

      <TagsField
        tags={values.tags}
        onChange={(tags) => {
          update('tags', tags);
        }}
      />

      <Field label="Points clés (optionnel)" htmlFor="technique-summary" error={errors.summary}>
        <textarea
          id="technique-summary"
          rows={4}
          value={values.summary}
          onChange={(e) => {
            update('summary', e.target.value);
          }}
          className={`${inputClass} w-full resize-none py-2`}
        />
      </Field>

      <VideoLinksField
        links={values.videoLinks}
        onChange={(videoLinks) => {
          update('videoLinks', videoLinks);
        }}
      />

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
