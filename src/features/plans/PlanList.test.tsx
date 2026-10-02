import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeGamePlan, makeGamePlanNode } from '@/test/factories';
import { PlanList } from './PlanList';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

function renderList() {
  return render(
    <MemoryRouter initialEntries={['/plans']}>
      <Routes>
        <Route path="/plans" element={<PlanList />} />
        <Route path="/plans/:id" element={<p>Plan screen</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PlanList', () => {
  it('lists existing plans with their attire and node count', async () => {
    const planId = await db.gamePlans.add(makeGamePlan({ name: 'Top game', attire: 'gi' }));
    await db.gamePlanNodes.add(makeGamePlanNode({ planId }));

    renderList();

    expect(await screen.findByText('Top game')).toBeInTheDocument();
    expect(screen.getByText('Gi · 1 nœud')).toBeInTheDocument();
  });

  it('creates a new plan from the inline form', async () => {
    renderList();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /Nouveau plan/ }));
    await user.type(screen.getByRole('textbox', { name: 'Nom' }), 'Bottom game');
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(await screen.findByText('Bottom game')).toBeInTheDocument();
  });

  it('navigates to the plan editor on tap', async () => {
    await db.gamePlans.add(makeGamePlan({ name: 'Top game' }));

    renderList();
    const user = userEvent.setup();

    await user.click(await screen.findByText('Top game'));

    expect(await screen.findByText('Plan screen')).toBeInTheDocument();
  });
});
