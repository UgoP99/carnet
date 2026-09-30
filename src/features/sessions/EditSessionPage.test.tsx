import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeActivity, makeSession } from '@/test/factories';
import { EditSessionPage } from './EditSessionPage';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('EditSessionPage', () => {
  it('prefills the form and updates the session on submit', async () => {
    const activity = makeActivity({ name: 'JJB perso' });
    await db.activities.add(activity);
    const session = makeSession({ activityId: activity.id, durationMin: 60, rpe: 5 });
    await db.sessions.add(session);

    render(
      <MemoryRouter initialEntries={[`/sessions/${session.id}/edit`]}>
        <Routes>
          <Route path="/sessions/:id/edit" element={<EditSessionPage />} />
          <Route path="/sessions/:id" element={<p>Détail</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: '60' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'Mettre à jour' }));

    expect(await screen.findByText('Détail')).toBeInTheDocument();
    const updated = await db.sessions.get(session.id);
    expect(updated?.rpe).toBe(8);
  });
});
