import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import { InvariantError } from './errors';
import {
  createGamePlan,
  createGamePlanNode,
  deleteGamePlanNode,
  indentGamePlanNode,
  listPlanNodes,
  moveGamePlanNode,
  outdentGamePlanNode,
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

describe('moveGamePlanNode', () => {
  it('swaps order with the previous sibling', async () => {
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

    await moveGamePlanNode(b.id, 'up');

    const nodes = await listPlanNodes(plan.id);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    expect(byId.get(b.id)?.order).toBe(0);
    expect(byId.get(a.id)?.order).toBe(1);
  });

  it('is a no-op at the start of the list', async () => {
    const plan = await makePlan();
    const a = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'a',
    });

    await moveGamePlanNode(a.id, 'up');

    expect((await db.gamePlanNodes.get(a.id))?.order).toBe(0);
  });

  it('is a no-op at the end of the list', async () => {
    const plan = await makePlan();
    const a = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'a',
    });

    await moveGamePlanNode(a.id, 'down');

    expect((await db.gamePlanNodes.get(a.id))?.order).toBe(0);
  });
});

describe('indentGamePlanNode', () => {
  it('makes the node the last child of its previous sibling', async () => {
    const plan = await makePlan();
    const a = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'a',
    });
    const existingChild = await createGamePlanNode({
      planId: plan.id,
      parentId: a.id,
      order: 0,
      kind: 'note',
      text: 'existing child',
    });
    const b = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 1,
      kind: 'note',
      text: 'b',
    });

    const indented = await indentGamePlanNode(b.id);

    expect(indented.parentId).toBe(a.id);
    expect(indented.order).toBe(existingChild.order + 1);
  });

  it('throws when there is no previous sibling', async () => {
    const plan = await makePlan();
    const a = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'a',
    });

    await expect(indentGamePlanNode(a.id)).rejects.toThrow(InvariantError);
  });

  it('rejects indenting past the depth limit', async () => {
    const plan = await makePlan();
    let parentId: string | null = null;
    for (let depth = 0; depth < 7; depth++) {
      const node = await createGamePlanNode({
        planId: plan.id,
        parentId,
        order: 0,
        kind: 'note',
        text: `depth ${depth}`,
      });
      parentId = node.id;
    }
    // Both children sit at the maximum allowed depth (8); indenting `toIndent` under
    // its previous sibling would push it to depth 9.
    await createGamePlanNode({
      planId: plan.id,
      parentId,
      order: 0,
      kind: 'note',
      text: 'previous sibling',
    });
    const toIndent = await createGamePlanNode({
      planId: plan.id,
      parentId,
      order: 1,
      kind: 'note',
      text: 'to indent',
    });

    await expect(indentGamePlanNode(toIndent.id)).rejects.toThrow(InvariantError);
  });
});

describe('outdentGamePlanNode', () => {
  it('moves the node to its grandparent, appended last', async () => {
    const plan = await makePlan();
    const root = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'root',
    });
    const otherRoot = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 1,
      kind: 'note',
      text: 'other root',
    });
    const child = await createGamePlanNode({
      planId: plan.id,
      parentId: root.id,
      order: 0,
      kind: 'note',
      text: 'child',
    });

    const outdented = await outdentGamePlanNode(child.id);

    expect(outdented.parentId).toBeNull();
    expect(outdented.order).toBe(otherRoot.order + 1);
  });

  it('throws when the node is already at the root', async () => {
    const plan = await makePlan();
    const root = await createGamePlanNode({
      planId: plan.id,
      parentId: null,
      order: 0,
      kind: 'note',
      text: 'root',
    });

    await expect(outdentGamePlanNode(root.id)).rejects.toThrow(InvariantError);
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
