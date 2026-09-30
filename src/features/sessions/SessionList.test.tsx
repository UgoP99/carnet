import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeActivity, makeSession } from '@/test/factories';
import { SessionList } from './SessionList';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('SessionList', () => {
  it('lists sessions grouped by week, newest first, and filters by activity', async () => {
    const judo = makeActivity({ name: 'Judo perso' });
    const lifting = makeActivity({ name: 'Muscu perso' });
    await db.activities.bulkAdd([judo, lifting]);
    await db.sessions.bulkAdd([
      makeSession({ activityId: judo.id, date: '2026-09-28', durationMin: 60, rpe: 6 }),
      makeSession({ activityId: lifting.id, date: '2026-09-20', durationMin: 45, rpe: 5 }),
    ]);

    render(
      <MemoryRouter>
        <SessionList />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('link', { name: /Judo perso/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Muscu perso/ })).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Judo perso' }));

    expect(screen.getByRole('link', { name: /Judo perso/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Muscu perso/ })).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no sessions', async () => {
    render(
      <MemoryRouter>
        <SessionList />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Aucune séance')).toBeInTheDocument();
  });
});
