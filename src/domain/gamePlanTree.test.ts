import { describe, expect, it } from 'vitest';
import { makeGamePlanNode } from '@/test/factories';
import { buildTree, nextOrder } from './gamePlanTree';

describe('buildTree', () => {
  it('nests children under their parent, sorted by order', () => {
    const planId = 'plan-1';
    const root = makeGamePlanNode({ id: 'root', planId, parentId: null, order: 0 });
    const childB = makeGamePlanNode({ id: 'b', planId, parentId: 'root', order: 1 });
    const childA = makeGamePlanNode({ id: 'a', planId, parentId: 'root', order: 0 });

    const tree = buildTree([root, childB, childA]);
    const [rootNode] = tree;

    expect(tree.map((n) => n.id)).toEqual(['root']);
    expect(rootNode?.children.map((n) => n.id)).toEqual(['a', 'b']);
  });

  it('nests grandchildren recursively', () => {
    const planId = 'plan-1';
    const root = makeGamePlanNode({ id: 'root', planId, parentId: null, order: 0 });
    const child = makeGamePlanNode({ id: 'child', planId, parentId: 'root', order: 0 });
    const grandchild = makeGamePlanNode({ id: 'grandchild', planId, parentId: 'child', order: 0 });

    const tree = buildTree([root, child, grandchild]);

    expect(tree[0]?.children[0]?.children.map((n) => n.id)).toEqual(['grandchild']);
  });

  it('sorts multiple roots by order and drops orphans', () => {
    const planId = 'plan-1';
    const rootB = makeGamePlanNode({ id: 'rootB', planId, parentId: null, order: 1 });
    const rootA = makeGamePlanNode({ id: 'rootA', planId, parentId: null, order: 0 });
    const orphan = makeGamePlanNode({ id: 'orphan', planId, parentId: 'missing', order: 0 });

    const tree = buildTree([rootB, rootA, orphan]);

    expect(tree.map((n) => n.id)).toEqual(['rootA', 'rootB']);
  });

  it('returns an empty array for no nodes', () => {
    expect(buildTree([])).toEqual([]);
  });
});

describe('nextOrder', () => {
  it('returns 0 when there are no children yet', () => {
    expect(nextOrder([], null)).toBe(0);
  });

  it('returns one past the highest sibling order', () => {
    const nodes = [
      makeGamePlanNode({ parentId: 'p', order: 0 }),
      makeGamePlanNode({ parentId: 'p', order: 3 }),
      makeGamePlanNode({ parentId: 'other', order: 9 }),
    ];
    expect(nextOrder(nodes, 'p')).toBe(4);
  });
});
