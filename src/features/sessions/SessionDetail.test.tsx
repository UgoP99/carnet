import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { createTechniqueLog } from '@/db/techniqueLogRepo';
import { makeActivity, makeSession, makeTechnique } from '@/test/factories';
import { SessionDetail } from './SessionDetail';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

function renderDetail(sessionId: string) {
  return render(
    <MemoryRouter initialEntries={[`/sessions/${sessionId}`]}>
      <Routes>
        <Route path="/sessions/:id" element={<SessionDetail />} />
        <Route path="/journal" element={<p>Journal</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SessionDetail', () => {
  it('shows the session fields read-only', async () => {
    const activity = makeActivity({ name: 'JJB perso' });
    await db.activities.add(activity);
    const session = makeSession({
      activityId: activity.id,
      date: '2026-09-28',
      durationMin: 60,
      rpe: 6,
      notes: 'Bon feeling',
    });
    await db.sessions.add(session);

    renderDetail(session.id);

    expect(await screen.findByText('JJB perso')).toBeInTheDocument();
    expect(screen.getByText('60 min')).toBeInTheDocument();
    expect(screen.getByText('Bon feeling')).toBeInTheDocument();
  });

  it('deletes the session on confirm and returns to the journal', async () => {
    const activity = makeActivity({ name: 'JJB perso' });
    await db.activities.add(activity);
    const session = makeSession({ activityId: activity.id });
    await db.sessions.add(session);

    renderDetail(session.id);
    await screen.findByText('JJB perso');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    expect(await screen.findByText('Journal')).toBeInTheDocument();
    expect(await db.sessions.get(session.id)).toBeUndefined();
  });

  it('shows the grappling block and technique logs with a link to the technique', async () => {
    const activity = makeActivity({ name: 'JJB perso', category: 'grappling' });
    await db.activities.add(activity);
    const technique = makeTechnique({ name: 'Armbar from closed guard' });
    await db.techniques.add(technique);
    const session = makeSession({
      activityId: activity.id,
      grappling: { attire: 'gi', content: ['sparring'], partners: ['Marc'] },
    });
    await db.sessions.add(session);
    await createTechniqueLog({
      techniqueId: technique.id,
      sessionId: session.id,
      date: session.date,
      text: 'Setup détaillé',
    });

    renderDetail(session.id);

    expect(await screen.findByText('Gi')).toBeInTheDocument();
    expect(screen.getByText('Marc')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: technique.name });
    expect(link).toHaveAttribute('href', `/techniques/${technique.id}`);
    expect(screen.getByText('Setup détaillé')).toBeInTheDocument();
  });
});
