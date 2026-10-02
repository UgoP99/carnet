import { GitBranch, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { createGamePlan } from '@/db/gamePlanRepo';
import { useAllGamePlanNodes, useGamePlans } from '@/db/hooks';
import {
  TECHNIQUE_ATTIRES,
  techniqueAttireLabels,
  type TechniqueAttire,
} from '@/domain/labels.grappling';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function PlanList() {
  const plans = useGamePlans();
  const nodes = useAllGamePlanNodes();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [attire, setAttire] = useState<TechniqueAttire>('both');
  const [error, setError] = useState<string>();

  const nodeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of nodes ?? []) map.set(n.planId, (map.get(n.planId) ?? 0) + 1);
    return map;
  }, [nodes]);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createGamePlan({ name: trimmed, attire });
      setName('');
      setAttire('both');
      setAdding(false);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  if (plans === undefined) return null;

  return (
    <div className="flex flex-col gap-4 pb-20">
      <h1 className="text-xl font-semibold">Plans de jeu</h1>

      {plans.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="Aucun plan"
          description="Crée ton premier plan de jeu avec le bouton ci-dessous."
        />
      ) : (
        <div className="flex flex-col gap-1">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              to={`/plans/${plan.id}`}
              className="flex min-h-11 items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {plan.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {techniqueAttireLabels[plan.attire]} · {nodeCounts.get(plan.id) ?? 0} nœud
                {(nodeCounts.get(plan.id) ?? 0) === 1 ? '' : 's'}
              </span>
            </Link>
          ))}
        </div>
      )}

      {adding ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Field label="Nom" htmlFor="new-plan-name">
            <input
              id="new-plan-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className={`${inputClass} w-full`}
            />
          </Field>
          <Field label="Tenue" htmlFor="new-plan-attire">
            <Segmented
              aria-label="Tenue"
              options={TECHNIQUE_ATTIRES.map((a) => ({
                value: a,
                label: techniqueAttireLabels[a],
              }))}
              value={attire}
              onChange={(v) => {
                setAttire(v as TechniqueAttire);
              }}
            />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAdding(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                void handleAdd();
              }}
            >
              Créer
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setAdding(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Nouveau plan
        </Button>
      )}
    </div>
  );
}
