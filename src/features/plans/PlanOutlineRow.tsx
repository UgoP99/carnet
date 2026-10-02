import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import type { PlanTreeNode } from '@/domain/gamePlanTree';
import { positionLabels } from '@/domain/labels.grappling';
import type { GamePlanNode, GamePlanNodeContent, Technique } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import {
  DEFAULT_PLAN_NODE_FORM_VALUES,
  gamePlanNodeToFormValues,
  PlanNodeForm,
} from './PlanNodeForm';

export type FormTarget =
  { kind: 'edit'; nodeId: string } | { kind: 'add'; parentId: string | null };

export interface OutlineState {
  mode: 'view' | 'edit';
  selectedId: string | null;
  collapsed: Set<string>;
  formTarget: FormTarget | null;
}

export interface OutlineActions {
  onSelect: (id: string | null) => void;
  onToggleCollapse: (id: string) => void;
  onStartEdit: (node: GamePlanNode) => void;
  onStartAddChild: (parentId: string) => void;
  onStartAddSibling: (parentId: string | null) => void;
  onCancelForm: () => void;
  onSubmitAdd: (parentId: string | null, content: GamePlanNodeContent) => Promise<void>;
  onSubmitEdit: (nodeId: string, content: GamePlanNodeContent) => Promise<void>;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onDelete: (node: GamePlanNode) => void;
}

interface PlanOutlineRowProps {
  node: PlanTreeNode;
  depth: number;
  isFirst: boolean;
  isLast: boolean;
  techniques: Technique[];
  state: OutlineState;
  actions: OutlineActions;
}

function nodeLabel(
  node: GamePlanNode,
  techniques: Technique[],
): { text: string; techniqueId?: string } {
  if (node.kind === 'position') {
    return { text: node.position ? positionLabels[node.position] : 'Position' };
  }
  if (node.kind === 'technique') {
    const technique = techniques.find((t) => t.id === node.techniqueId);
    if (!technique) return { text: 'Technique introuvable' };
    return { text: technique.name, techniqueId: technique.id };
  }
  return { text: node.text ?? '' };
}

export function PlanOutlineRow({
  node,
  depth,
  isFirst,
  isLast,
  techniques,
  state,
  actions,
}: PlanOutlineRowProps) {
  const selected = state.selectedId === node.id;
  const collapsed = state.collapsed.has(node.id);
  const hasChildren = node.children.length > 0;
  const { text: label, techniqueId } = nodeLabel(node, techniques);
  const editing = state.formTarget?.kind === 'edit' && state.formTarget.nodeId === node.id;
  const addingChild = state.formTarget?.kind === 'add' && state.formTarget.parentId === node.id;

  const content = (
    <>
      <span className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
        {node.condition && (
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            ({node.condition})
          </span>
        )}
        {label}
      </span>
      {node.text && node.kind !== 'note' && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{node.text}</span>
      )}
    </>
  );

  return (
    <div className="flex flex-col" style={{ paddingLeft: depth === 0 ? 0 : 16 }}>
      <div className="flex min-h-11 items-center gap-1 rounded-lg px-1 py-1">
        {hasChildren ? (
          <button
            type="button"
            aria-label={collapsed ? `Déplier ${label}` : `Replier ${label}`}
            onClick={() => {
              actions.onToggleCollapse(node.id);
            }}
            className="flex min-h-8 min-w-8 items-center justify-center text-slate-400"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : (
          <span className="min-w-8" />
        )}

        {state.mode === 'edit' ? (
          <button
            type="button"
            onClick={() => {
              actions.onSelect(selected ? null : node.id);
            }}
            className="flex min-h-11 flex-1 flex-col items-start justify-center text-left"
          >
            {content}
          </button>
        ) : (
          <div className="flex flex-1 flex-col items-start justify-center">{content}</div>
        )}

        {techniqueId && (
          <Link
            to={`/techniques/${techniqueId}`}
            aria-label={`Voir la technique ${label}`}
            className="flex min-h-11 min-w-11 items-center justify-center text-sky-600 dark:text-sky-400"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        )}
      </div>

      {state.mode === 'edit' && selected && !editing && (
        <div className="mb-2 flex flex-wrap gap-1 pl-9">
          <Button
            variant="secondary"
            onClick={() => {
              actions.onStartEdit(node);
            }}
          >
            Modifier
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              actions.onStartAddChild(node.id);
            }}
          >
            + Enfant
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              actions.onStartAddSibling(node.parentId);
            }}
          >
            + Frère
          </Button>
          <Button
            variant="secondary"
            disabled={isFirst}
            aria-label="Monter"
            onClick={() => {
              actions.onMove(node.id, 'up');
            }}
          >
            ↑
          </Button>
          <Button
            variant="secondary"
            disabled={isLast}
            aria-label="Descendre"
            onClick={() => {
              actions.onMove(node.id, 'down');
            }}
          >
            ↓
          </Button>
          <Button
            variant="secondary"
            disabled={isFirst}
            onClick={() => {
              actions.onIndent(node.id);
            }}
          >
            Indenter
          </Button>
          <Button
            variant="secondary"
            disabled={node.parentId === null}
            onClick={() => {
              actions.onOutdent(node.id);
            }}
          >
            Sortir
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              actions.onDelete(node);
            }}
          >
            Supprimer
          </Button>
        </div>
      )}

      {editing && (
        <div className="pl-9">
          <PlanNodeForm
            initial={gamePlanNodeToFormValues(node, techniques)}
            techniques={techniques}
            submitLabel="Enregistrer"
            onCancel={actions.onCancelForm}
            onSubmit={(nodeContent) => actions.onSubmitEdit(node.id, nodeContent)}
          />
        </div>
      )}

      {!collapsed && (
        <div className="flex flex-col">
          {node.children.map((child, index) => (
            <PlanOutlineRow
              key={child.id}
              node={child}
              depth={depth + 1}
              isFirst={index === 0}
              isLast={index === node.children.length - 1}
              techniques={techniques}
              state={state}
              actions={actions}
            />
          ))}
          {addingChild && (
            <div className="pl-4">
              <PlanNodeForm
                initial={DEFAULT_PLAN_NODE_FORM_VALUES}
                techniques={techniques}
                submitLabel="Ajouter"
                onCancel={actions.onCancelForm}
                onSubmit={(nodeContent) => actions.onSubmitAdd(node.id, nodeContent)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
