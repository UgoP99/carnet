import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeSession, makeTechnique, makeTechniqueLog } from '@/test/factories';
import { TechniqueDetail } from './TechniqueDetail';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/techniques/${id}`]}>
      <Routes>
        <Route path="/techniques/:id" element={<TechniqueDetail />} />
        <Route path="/techniques" element={<p>Liste</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TechniqueDetail', () => {
  it('shows the timeline with a link to the originating session', async () => {
    const technique = makeTechnique({ name: 'Armbar' });
    await db.techniques.add(technique);
    const session = makeSession({ date: '2026-09-20' });
    await db.sessions.add(session);
    await db.techniqueLogs.add(
      makeTechniqueLog({
        techniqueId: technique.id,
        sessionId: session.id,
        date: session.date,
        text: 'Bien marché',
      }),
    );

    renderDetail(technique.id);

    expect(await screen.findByText('Bien marché')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'séance' })).toHaveAttribute(
      'href',
      `/sessions/${session.id}`,
    );
    expect(screen.getByText(/Vue 1×/)).toBeInTheDocument();
  });

  it('adds a standalone note', async () => {
    const technique = makeTechnique({ name: 'Armbar' });
    await db.techniques.add(technique);
    renderDetail(technique.id);
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Ajouter une note'), 'Détail du jour');
    await user.click(screen.getByRole('button', { name: 'Ajouter la note' }));

    expect(await screen.findByText('Détail du jour')).toBeInTheDocument();
    const logs = await db.techniqueLogs.where('techniqueId').equals(technique.id).toArray();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.sessionId).toBeUndefined();
    expect(logs[0]).toMatchObject({ text: 'Détail du jour' });
  });

  it('archives instead of deleting a technique with logs', async () => {
    const technique = makeTechnique({ name: 'Armbar' });
    await db.techniques.add(technique);
    await db.techniqueLogs.add(makeTechniqueLog({ techniqueId: technique.id }));

    renderDetail(technique.id);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await db.techniques.get(technique.id)).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Archiver' }));
    expect(await screen.findByText('Archivée')).toBeInTheDocument();
  });

  it('hard-deletes an unreferenced technique', async () => {
    const technique = makeTechnique({ name: 'Armbar' });
    await db.techniques.add(technique);

    renderDetail(technique.id);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    expect(await screen.findByText('Liste')).toBeInTheDocument();
    expect(await db.techniques.get(technique.id)).toBeUndefined();
  });
});
