import { useId, useMemo, useState } from 'react';
import {
  GAME_PLAN_NODE_KINDS,
  gamePlanNodeKindLabels,
  type GamePlanNodeKind,
} from '@/domain/labels';
import { POSITIONS, positionLabels, type Position } from '@/domain/labels.grappling';
import {
  gamePlanNodeContentSchema,
  type GamePlanNode,
  type GamePlanNodeContent,
  type Technique,
} from '@/domain/schemas';
import { normalize } from '@/lib/text';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';

export interface PlanNodeFormValues {
  kind: GamePlanNodeKind;
  position: Position;
  techniqueId: string;
  techniqueName: string;
  text: string;
  condition: string;
}

export function gamePlanNodeToFormValues(
  node: GamePlanNode,
  techniques: Technique[],
): PlanNodeFormValues {
  const technique = node.techniqueId
    ? techniques.find((t) => t.id === node.techniqueId)
    : undefined;
  return {
    kind: node.kind,
    position: node.position ?? 'standing',
    techniqueId: node.techniqueId ?? '',
    techniqueName: technique?.name ?? '',
    text: node.text ?? '',
    condition: node.condition ?? '',
  };
}

export const DEFAULT_PLAN_NODE_FORM_VALUES: PlanNodeFormValues = {
  kind: 'note',
  position: 'standing',
  techniqueId: '',
  techniqueName: '',
  text: '',
  condition: '',
};

interface PlanNodeFormProps {
  initial: PlanNodeFormValues;
  techniques: Technique[];
  submitLabel: string;
  onSubmit: (input: GamePlanNodeContent) => Promise<void>;
  onCancel: () => void;
}

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function PlanNodeForm({
  initial,
  techniques,
  submitLabel,
  onSubmit,
  onCancel,
}: PlanNodeFormProps) {
  const [values, setValues] = useState(initial);
  const [query, setQuery] = useState(initial.techniqueName);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>();
  const positionId = useId();
  const textId = useId();

  function update<K extends keyof PlanNodeFormValues>(key: K, value: PlanNodeFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const matches = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0 || values.techniqueId) return [];
    return techniques
      .filter((t) => !t.archived && normalize(t.name).includes(normalize(trimmed)))
      .slice(0, 8);
  }, [query, techniques, values.techniqueId]);

  async function handleSubmit() {
    const raw = {
      kind: values.kind,
      position: values.kind === 'position' ? values.position : undefined,
      techniqueId: values.kind === 'technique' ? values.techniqueId || undefined : undefined,
      text: values.text.trim() || undefined,
      condition: values.condition.trim() || undefined,
    };
    const result = gamePlanNodeContentSchema.safeParse(raw);
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
      className="flex flex-col gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
    >
      <Field label="Type" htmlFor="plan-node-kind" error={errors.kind}>
        <Segmented
          aria-label="Type de nœud"
          options={GAME_PLAN_NODE_KINDS.map((k) => ({
            value: k,
            label: gamePlanNodeKindLabels[k],
          }))}
          value={values.kind}
          onChange={(v) => {
            update('kind', v as GamePlanNodeKind);
          }}
        />
      </Field>

      {values.kind === 'position' && (
        <Field label="Position" htmlFor={positionId} error={errors.position}>
          <select
            id={positionId}
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
      )}

      {values.kind === 'technique' && (
        <Field label="Technique" htmlFor="plan-node-technique" error={errors.techniqueId}>
          <input
            id="plan-node-technique"
            type="text"
            placeholder="Rechercher une technique…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              update('techniqueId', '');
            }}
            className={`${inputClass} w-full`}
          />
          {matches.length > 0 && (
            <div className="mt-1 flex flex-col gap-1">
              {matches.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    update('techniqueId', t.id);
                    setQuery(t.name);
                  }}
                  className="min-h-11 rounded-lg border border-slate-200 px-3 text-left text-sm dark:border-slate-700"
                >
                  {t.name}{' '}
                  <span className="text-slate-500 dark:text-slate-400">
                    ({positionLabels[t.position]})
                  </span>
                </button>
              ))}
            </div>
          )}
        </Field>
      )}

      <Field
        label={values.kind === 'note' ? 'Texte' : 'Commentaire (optionnel)'}
        htmlFor={textId}
        error={errors.text}
      >
        <textarea
          id={textId}
          rows={values.kind === 'note' ? 3 : 2}
          value={values.text}
          onChange={(e) => {
            update('text', e.target.value);
          }}
          className={`${inputClass} w-full resize-none py-2`}
        />
      </Field>

      <Field
        label="Condition (optionnel)"
        htmlFor="plan-node-condition"
        error={errors.condition}
        hint="ex. « s'il sprawl »"
      >
        <input
          id="plan-node-condition"
          type="text"
          value={values.condition}
          onChange={(e) => {
            update('condition', e.target.value);
          }}
          className={`${inputClass} w-full`}
        />
      </Field>

      {submitError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
