import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { getSessionDraft } from '@/db/metaRepo';
import { makeActivity, makeSession, makeTechnique } from '@/test/factories';
import { NewSessionPage } from './NewSessionPage';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

function renderNew(initialEntry = '/sessions/new') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/sessions/new" element={<NewSessionPage />} />
        <Route path="/sessions/:id" element={<p>Détail</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NewSessionPage', () => {
  it('creates a session and clears the draft', async () => {
    const activity = makeActivity({ name: 'JJB perso' });
    await db.activities.add(activity);

    renderNew();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'JJB perso' }));
    await user.click(screen.getByRole('button', { name: '60' }));
    await user.click(screen.getByRole('radio', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Détail')).toBeInTheDocument();
    const sessions = await db.sessions.toArray();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]).toMatchObject({ activityId: activity.id, durationMin: 60, rpe: 5 });
    expect(await getSessionDraft()).toBeUndefined();
  });

  it('prefills activity and duration from the most recent session', async () => {
    const activity = makeActivity({ name: 'JJB perso' });
    await db.activities.add(activity);
    await db.sessions.add(
      makeSession({ activityId: activity.id, date: '2026-09-20', durationMin: 90 }),
    );

    renderNew();

    expect(await screen.findByRole('button', { name: '90' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('prefills from the duplicated session via ?from=', async () => {
    const activity = makeActivity({ name: 'JJB perso' });
    await db.activities.add(activity);
    const original = makeSession({ activityId: activity.id, durationMin: 75, rpe: 9 });
    await db.sessions.add(original);

    renderNew(`/sessions/new?from=${original.id}`);

    expect(await screen.findByRole('button', { name: '75' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Choisis une intensité')).toBeInTheDocument();
  });

  it('logs a grappling session with an existing and a newly created technique', async () => {
    const activity = makeActivity({ name: 'JJB perso', category: 'grappling' });
    await db.activities.add(activity);
    const existing = makeTechnique({ name: 'Armbar from closed guard' });
    await db.techniques.add(existing);

    renderNew();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'JJB perso' }));
    await user.click(screen.getByRole('button', { name: '60' }));
    await user.click(screen.getByRole('radio', { name: '5' }));

    const search = screen.getByRole('textbox', { name: 'Rechercher ou créer une technique' });
    await user.type(search, 'Armbar');
    await user.click(screen.getByRole('button', { name: /Armbar from closed guard/ }));

    await user.type(search, 'Triangle');
    await user.click(screen.getByRole('button', { name: /Créer.*Triangle/ }));
    await user.click(screen.getByRole('button', { name: 'Créer et ajouter' }));

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Détail')).toBeInTheDocument();
    const sessions = await db.sessions.toArray();
    expect(sessions).toHaveLength(1);
    const logs = await db.techniqueLogs.where('sessionId').equals(sessions[0]!.id).toArray();
    expect(logs).toHaveLength(2);
    expect(logs.every((l) => l.date === sessions[0]!.date)).toBe(true);
  });

  it('duplicates a session carrying over the grappling block but not its techniques', async () => {
    const activity = makeActivity({ name: 'JJB perso', category: 'grappling' });
    await db.activities.add(activity);
    const original = makeSession({
      activityId: activity.id,
      durationMin: 60,
      rpe: 7,
      grappling: { attire: 'gi', content: ['sparring'], partners: ['Marc'] },
    });
    await db.sessions.add(original);

    renderNew(`/sessions/new?from=${original.id}`);

    expect(await screen.findByText('Techniques vues')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gi' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Retirer Marc' })).toBeInTheDocument();
  });
});
