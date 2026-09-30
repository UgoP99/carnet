import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { InvariantError } from './errors';
import {
  createGamePlan,
  createGamePlanNode,
  deleteGamePlanNode,
  listPlanNodes,
  updateGamePlanNode,
} from './gamePlanRepo';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

async function makePlan() {
  return createGamePlan({ name: 'Top game', attire: 'gi' });
}

describe('createGamePlanNode', () => {
  it('creates a root node', async () => {
    const plan = await makePlan();
    const node = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'Start',
    });
    expect(node.id).toBeTruthy();
  });

  it('creates a child under a parent in the same plan', async () => {
    const plan = await makePlan();
    const root = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'position',
      position: 'closed_guard',
    });
    const child = await createGamePlanNode({
      planId: plan.id,
      parentId: root.id,
      order: 0,
      kind: 'note',
      text: 'Break posture',
    });
    expect(child.parentId).toBe(root.id);
  });

  it('rejects a parent from a different plan', async () => {
    const planA = await makePlan();
    const planB = await makePlan();
    const rootA = await createGamePlanNode({
      planId: planA.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'A',
    });
    await expect(
      createGamePlanNode({
        planId: planB.id,
        parentId: rootA.id,
        order: 0,
        kind: 'note',
        text: 'B',
      }),
    ).rejects.toThrow(InvariantError);
  });

  it('rejects a chain deeper than 8', async () => {
    const plan = await makePlan();
    let parentId: string | null = null;
    for (let depth = 0; depth < 8; depth++) {
      const node = await createGamePlanNode({
        planId: plan.id,
        parentId,
        order: 0,
        kind: 'note',
        text: `depth ${depth}`,
      });
      parentId = node.id;
    }
    await expect(
      createGamePlanNode({ planId: plan.id, parentId, order: 0, kind: 'note', text: 'too deep' }),
    ).rejects.toThrow(InvariantError);
  });
});

describe('updateGamePlanNode — reparenting', () => {
  it('rejects creating a cycle (parenting a node under its own descendant)', async () => {
    const plan = await makePlan();
    const root = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'root',
    });
    const child = await createGamePlanNode({
      planId: plan.id,
      parentId: root.id,
      order: 0,
      kind: 'note',
      text: 'child',
    });

    await expect(updateGamePlanNode(root.id, { parentId: child.id })).rejects.toThrow(
      InvariantError,
    );
  });

  it('allows moving a node to a new valid parent', async () => {
    const plan = await makePlan();
    const a = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'a',
    });
    const b = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 1,
      kind: 'note',
      text: 'b',
    });
    const moved = await updateGamePlanNode(b.id, { parentId: a.id });
    expect(moved.parentId).toBe(a.id);
  });
});

describe('deleteGamePlanNode', () => {
  it('deletes the whole subtree', async () => {
    const plan = await makePlan();
    const root = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'root',
    });
    const child = await createGamePlanNode({
      planId: plan.id,
      parentId: root.id,
      order: 0,
      kind: 'note',
      text: 'child',
    });
    const grandchild = await createGamePlanNode({
      planId: plan.id,
      parentId: child.id,
      order: 0,
      kind: 'note',
      text: 'grandchild',
    });
    const sibling = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 1,
      kind: 'note',
      text: 'sibling',
    });

    await deleteGamePlanNode(root.id);

    const remaining = await listPlanNodes(plan.id);
    expect(remaining.map((n) => n.id)).toEqual([sibling.id]);
    expect(await db.gamePlanNodes.get(child.id)).toBeUndefined();
    expect(await db.gamePlanNodes.get(grandchild.id)).toBeUndefined();
  });
});
