import { nextOrder } from '@/domain/gamePlanTree';
import { newId } from '@/lib/id';
import {
  gamePlanNodeSchema,
  gamePlanSchema,
  type GamePlan,
  type GamePlanNode,
} from '@/domain/schemas';
import { db } from './db';
import { InvariantError } from './errors';

const MAX_DEPTH = 8;

export type CreateGamePlanInput = Omit<GamePlan, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateGamePlanInput = Partial<Omit<GamePlan, 'id' | 'createdAt' | 'updatedAt'>>;
export type CreateGamePlanNodeInput = Omit<GamePlanNode, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateGamePlanNodeInput = Partial<
  Omit<GamePlanNode, 'id' | 'planId' | 'createdAt' | 'updatedAt'>
>;

export async function listGamePlans(): Promise<GamePlan[]> {
  return db.gamePlans.toArray();
}

export async function getGamePlan(id: string): Promise<GamePlan | undefined> {
  return db.gamePlans.get(id);
}

export async function createGamePlan(input: CreateGamePlanInput): Promise<GamePlan> {
  const now = new Date().toISOString();
  const plan = gamePlanSchema.parse({ ...input, id: newId(), createdAt: now, updatedAt: now });
  await db.gamePlans.add(plan);
  return plan;
}

export async function updateGamePlan(id: string, patch: UpdateGamePlanInput): Promise<GamePlan> {
  const existing = await db.gamePlans.get(id);
  if (!existing) throw new InvariantError(`Plan introuvable : ${id}`);
  const updated = gamePlanSchema.parse({
    ...existing,
    ...patch,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await db.gamePlans.put(updated);
  return updated;
}

/** Deletes a plan and all of its nodes, one transaction. */
export async function deleteGamePlan(id: string): Promise<void> {
  await db.transaction('rw', [db.gamePlans, db.gamePlanNodes], async () => {
    await db.gamePlanNodes.where('planId').equals(id).delete();
    await db.gamePlans.delete(id);
  });
}

export async function listPlanNodes(planId: string): Promise<GamePlanNode[]> {
  return db.gamePlanNodes.where('planId').equals(planId).toArray();
}

/** Invariant 6: parent belongs to the same plan, no cycles, depth ≤ 8. */
async function assertValidPlacement(
  planId: string,
  nodeId: string,
  parentId: string | null,
): Promise<void> {
  if (parentId === null) return;
  const siblings = await db.gamePlanNodes.where('planId').equals(planId).toArray();
  const byId = new Map(siblings.map((n) => [n.id, n]));
  const parent = byId.get(parentId);
  if (!parent) throw new InvariantError('Le parent doit appartenir au même plan.');

  let depth = 1;
  let ancestor: GamePlanNode | undefined = parent;
  const seen = new Set<string>();
  while (ancestor) {
    if (ancestor.id === nodeId || seen.has(ancestor.id)) {
      throw new InvariantError('Cycle détecté dans le plan.');
    }
    seen.add(ancestor.id);
    depth += 1;
    ancestor = ancestor.parentId === null ? undefined : byId.get(ancestor.parentId);
  }

  if (depth > MAX_DEPTH) throw new InvariantError(`Profondeur maximale (${MAX_DEPTH}) dépassée.`);
}

export async function createGamePlanNode(input: CreateGamePlanNodeInput): Promise<GamePlanNode> {
  const id = newId();
  await assertValidPlacement(input.planId, id, input.parentId);
  const now = new Date().toISOString();
  const node = gamePlanNodeSchema.parse({ ...input, id, createdAt: now, updatedAt: now });
  await db.gamePlanNodes.add(node);
  return node;
}

export async function updateGamePlanNode(
  id: string,
  patch: UpdateGamePlanNodeInput,
): Promise<GamePlanNode> {
  const existing = await db.gamePlanNodes.get(id);
  if (!existing) throw new InvariantError(`Nœud introuvable : ${id}`);
  const nextParentId = patch.parentId !== undefined ? patch.parentId : existing.parentId;
  if (nextParentId !== existing.parentId) {
    await assertValidPlacement(existing.planId, id, nextParentId);
  }
  const updated = gamePlanNodeSchema.parse({
    ...existing,
    ...patch,
    id,
    planId: existing.planId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  await db.gamePlanNodes.put(updated);
  return updated;
}

async function siblingsOf(planId: string, parentId: string | null): Promise<GamePlanNode[]> {
  const all = await db.gamePlanNodes.where('planId').equals(planId).toArray();
  return all.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order);
}

/** Swaps order with the previous/next sibling. No-op at the start/end of the list. */
export async function moveGamePlanNode(id: string, direction: 'up' | 'down'): Promise<void> {
  const node = await db.gamePlanNodes.get(id);
  if (!node) throw new InvariantError(`Nœud introuvable : ${id}`);
  const siblings = await siblingsOf(node.planId, node.parentId);
  const index = siblings.findIndex((n) => n.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return;
  const other = siblings[swapIndex];
  if (!other) return;
  const now = new Date().toISOString();
  await db.transaction('rw', db.gamePlanNodes, async () => {
    await db.gamePlanNodes.update(node.id, { order: other.order, updatedAt: now });
    await db.gamePlanNodes.update(other.id, { order: node.order, updatedAt: now });
  });
}

/** Makes the node a child of its previous sibling, appended last. Throws if there is none. */
export async function indentGamePlanNode(id: string): Promise<GamePlanNode> {
  const node = await db.gamePlanNodes.get(id);
  if (!node) throw new InvariantError(`Nœud introuvable : ${id}`);
  const siblings = await siblingsOf(node.planId, node.parentId);
  const index = siblings.findIndex((n) => n.id === id);
  if (index <= 0) throw new InvariantError('Pas de nœud précédent pour indenter.');
  const newParent = siblings[index - 1];
  if (!newParent) throw new InvariantError('Pas de nœud précédent pour indenter.');
  const newSiblings = await siblingsOf(node.planId, newParent.id);
  return updateGamePlanNode(id, {
    parentId: newParent.id,
    order: nextOrder(newSiblings, newParent.id),
  });
}

/** Moves the node up to its grandparent, appended last. Throws if already at the root. */
export async function outdentGamePlanNode(id: string): Promise<GamePlanNode> {
  const node = await db.gamePlanNodes.get(id);
  if (!node) throw new InvariantError(`Nœud introuvable : ${id}`);
  if (node.parentId === null) throw new InvariantError('Déjà à la racine.');
  const parent = await db.gamePlanNodes.get(node.parentId);
  if (!parent) throw new InvariantError('Parent introuvable.');
  const newSiblings = await siblingsOf(node.planId, parent.parentId);
  return updateGamePlanNode(id, {
    parentId: parent.parentId,
    order: nextOrder(newSiblings, parent.parentId),
  });
}

/** Deletes a node and its whole subtree, one transaction. */
export async function deleteGamePlanNode(id: string): Promise<void> {
  await db.transaction('rw', db.gamePlanNodes, async () => {
    const node = await db.gamePlanNodes.get(id);
    if (!node) return;
    const all = await db.gamePlanNodes.where('planId').equals(node.planId).toArray();
    const childrenOf = new Map<string, string[]>();
    for (const n of all) {
      if (n.parentId === null) continue;
      childrenOf.set(n.parentId, [...(childrenOf.get(n.parentId) ?? []), n.id]);
    }
    const toDelete: string[] = [];
    const stack = [id];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      toDelete.push(current);
      stack.push(...(childrenOf.get(current) ?? []));
    }
    await db.gamePlanNodes.bulkDelete(toDelete);
  });
}
