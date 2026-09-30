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
