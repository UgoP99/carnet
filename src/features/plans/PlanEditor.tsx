import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  createGamePlanNode,
  deleteGamePlan,
  deleteGamePlanNode,
  indentGamePlanNode,
  moveGamePlanNode,
  outdentGamePlanNode,
  updateGamePlanNode,
} from '@/db/gamePlanRepo';
import { useGamePlan, useGamePlanNodes, useTechniques } from '@/db/hooks';
import { buildTree, nextOrder } from '@/domain/gamePlanTree';
import { techniqueAttireLabels } from '@/domain/labels.grappling';
import type { GamePlanNode, GamePlanNodeContent } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { PlanEditorDialogs } from './PlanEditorDialogs';
import { DEFAULT_PLAN_NODE_FORM_VALUES, PlanNodeForm } from './PlanNodeForm';
import {
  PlanOutlineRow,
  type FormTarget,
  type OutlineActions,
  type OutlineState,
} from './PlanOutlineRow';

export function PlanEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plan = useGamePlan(id);
  const nodes = useGamePlanNodes(id);
  const techniques = useTechniques();

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deletingNode, setDeletingNode] = useState<GamePlanNode | null>(null);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [error, setError] = useState<string>();

  const tree = useMemo(() => buildTree(nodes ?? []), [nodes]);

  async function runAction(action: () => Promise<unknown>) {
    try {
      await action();
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  async function submitAdd(parentId: string | null, content: GamePlanNodeContent) {
    if (!id || !nodes) return;
    await createGamePlanNode({
      planId: id,
      parentId,
      order: nextOrder(nodes, parentId),
      ...content,
    });
    setFormTarget(null);
    setSelectedId(null);
  }

  async function submitEdit(nodeId: string, content: GamePlanNodeContent) {
    await updateGamePlanNode(nodeId, content);
    setFormTarget(null);
    setSelectedId(null);
  }

  const actions: OutlineActions = {
    onSelect: setSelectedId,
    onToggleCollapse: (nodeId) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
    },
    onStartEdit: (node) => {
      setFormTarget({ kind: 'edit', nodeId: node.id });
    },
    onStartAddChild: (parentId) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
      setFormTarget({ kind: 'add', parentId });
    },
    onStartAddSibling: (parentId) => {
      setFormTarget({ kind: 'add', parentId });
    },
    onCancelForm: () => {
      setFormTarget(null);
    },
    onSubmitAdd: (parentId, content) => runAction(() => submitAdd(parentId, content)),
    onSubmitEdit: (nodeId, content) => runAction(() => submitEdit(nodeId, content)),
    onMove: (nodeId, direction) => {
      void runAction(() => moveGamePlanNode(nodeId, direction));
    },
    onIndent: (nodeId) => {
      void runAction(() => indentGamePlanNode(nodeId));
    },
    onOutdent: (nodeId) => {
      void runAction(() => outdentGamePlanNode(nodeId));
    },
    onDelete: (node) => {
      setDeletingNode(node);
    },
  };

  const state: OutlineState = { mode, selectedId, collapsed, formTarget };

  return (
    <div className="flex flex-col gap-4 pb-20">
      <h1 className="text-xl font-semibold">Plan de jeu</h1>

      {plan === undefined || nodes === undefined || techniques === undefined ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-slate-900 dark:text-white">{plan.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {techniqueAttireLabels[plan.attire]}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setMode((m) => (m === 'edit' ? 'view' : 'edit'));
                setSelectedId(null);
                setFormTarget(null);
              }}
            >
              {mode === 'edit' ? 'Terminé' : 'Modifier'}
            </Button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {tree.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="Plan vide"
              description={
                mode === 'edit'
                  ? 'Ajoute un premier nœud ci-dessous.'
                  : 'Passe en mode édition pour commencer.'
              }
            />
          ) : (
            <div className="flex flex-col">
              {tree.map((node, index) => (
                <PlanOutlineRow
                  key={node.id}
                  node={node}
                  depth={0}
                  isFirst={index === 0}
                  isLast={index === tree.length - 1}
                  techniques={techniques}
                  state={state}
                  actions={actions}
                />
              ))}
            </div>
          )}

          {mode === 'edit' && formTarget?.kind === 'add' && formTarget.parentId === null && (
            <PlanNodeForm
              initial={DEFAULT_PLAN_NODE_FORM_VALUES}
              techniques={techniques}
              submitLabel="Ajouter"
              onCancel={() => {
                setFormTarget(null);
              }}
              onSubmit={(content) => submitAdd(null, content)}
            />
          )}

          {mode === 'edit' && formTarget === null && (
            <Button
              variant="secondary"
              onClick={() => {
                setFormTarget({ kind: 'add', parentId: null });
              }}
            >
              <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Ajouter à la racine
            </Button>
          )}

          {mode === 'edit' && (
            <Button
              variant="danger"
              onClick={() => {
                setDeletingPlan(true);
              }}
            >
              <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" /> Supprimer le plan
            </Button>
          )}

          <PlanEditorDialogs
            deletingNode={deletingNode !== null}
            onConfirmDeleteNode={() => {
              const node = deletingNode;
              setDeletingNode(null);
              if (node) void runAction(() => deleteGamePlanNode(node.id));
            }}
            onCancelDeleteNode={() => {
              setDeletingNode(null);
            }}
            deletingPlan={deletingPlan}
            onConfirmDeletePlan={() => {
              setDeletingPlan(false);
              void runAction(async () => {
                if (!id) return;
                await deleteGamePlan(id);
                void navigate('/plans');
              });
            }}
            onCancelDeletePlan={() => {
              setDeletingPlan(false);
            }}
          />
        </>
      )}
    </div>
  );
}
