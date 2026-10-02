import type { GamePlanNode } from './schemas';

export interface PlanTreeNode extends GamePlanNode {
  children: PlanTreeNode[];
}

/** Nests flat nodes into a tree, siblings sorted by `order`. Orphans (missing parent) are dropped. */
export function buildTree(nodes: GamePlanNode[]): PlanTreeNode[] {
  const byParent = new Map<string | null, GamePlanNode[]>();
  for (const node of nodes) {
    const siblings = byParent.get(node.parentId);
    if (siblings) siblings.push(node);
    else byParent.set(node.parentId, [node]);
  }

  function build(parentId: string | null): PlanTreeNode[] {
    const children = byParent.get(parentId) ?? [];
    return [...children]
      .sort((a, b) => a.order - b.order)
      .map((node) => ({ ...node, children: build(node.id) }));
  }

  return build(null);
}

/** Order to append a new node as the last child of `parentId` (0 if there are no children yet). */
export function nextOrder(
  nodes: Pick<GamePlanNode, 'parentId' | 'order'>[],
  parentId: string | null,
): number {
  const siblings = nodes.filter((n) => n.parentId === parentId);
  if (siblings.length === 0) return 0;
  return Math.max(...siblings.map((n) => n.order)) + 1;
}
