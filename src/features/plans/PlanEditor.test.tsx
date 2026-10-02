import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeGamePlan, makeGamePlanNode } from '@/test/factories';
import { PlanEditor } from './PlanEditor';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

async function renderEditor(planId: string) {
  render(
    <MemoryRouter initialEntries={[`/plans/${planId}`]}>
      <Routes>
        <Route path="/plans/:id" element={<PlanEditor />} />
      </Routes>
    </MemoryRouter>,
  );
  return screen.findByRole('button', { name: 'Modifier' });
}

describe('PlanEditor', () => {
  it('adds a root note from the edit mode form', async () => {
    const planId = await db.gamePlans.add(makeGamePlan({ name: 'Top game' }));
    const user = userEvent.setup();
    await user.click(await renderEditor(planId));

    await user.click(screen.getByRole('button', { name: /Ajouter à la racine/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Texte' }), 'Break posture');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    await waitFor(() => {
      expect(screen.getByText('Break posture')).toBeInTheDocument();
    });
  });

  it('indents a node under its previous sibling', async () => {
    const planId = await db.gamePlans.add(makeGamePlan({ name: 'Top game' }));
    await db.gamePlanNodes.bulkAdd([
      makeGamePlanNode({ planId, parentId: null, order: 0, kind: 'note', text: 'First' }),
      makeGamePlanNode({ planId, parentId: null, order: 1, kind: 'note', text: 'Second' }),
    ]);
    const user = userEvent.setup();
    await user.click(await renderEditor(planId));

    await user.click(await screen.findByText('Second'));
    await user.click(screen.getByRole('button', { name: 'Indenter' }));

    await waitFor(async () => {
      const nodes = await db.gamePlanNodes.where('planId').equals(planId).toArray();
      const second = nodes.find((n) => n.text === 'Second');
      const first = nodes.find((n) => n.text === 'First');
      expect(second?.parentId).toBe(first?.id);
    });
  });

  it('deletes a node after confirmation', async () => {
    const planId = await db.gamePlans.add(makeGamePlan({ name: 'Top game' }));
    await db.gamePlanNodes.add(
      makeGamePlanNode({ planId, parentId: null, order: 0, kind: 'note', text: 'To delete' }),
    );
    const user = userEvent.setup();
    await user.click(await renderEditor(planId));

    await user.click(await screen.findByText('To delete'));
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => {
      expect(screen.queryByText('To delete')).not.toBeInTheDocument();
    });
  });
});
