import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeActivity, makeSession } from '@/test/factories';
import { ActivitiesSettings } from './ActivitiesSettings';

beforeEach(async () => {
  await db.delete();
  await db.open();
  await db.activities.clear(); // drop the seeded defaults for deterministic assertions
});

describe('ActivitiesSettings', () => {
  it('adds a new activity', async () => {
    const user = userEvent.setup();
    render(<ActivitiesSettings />);

    await user.click(await screen.findByRole('button', { name: '+ Ajouter une activité' }));
    await user.type(screen.getByLabelText('Nom'), 'Judo perso');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(await screen.findByText('Judo perso')).toBeInTheDocument();
    const stored = await db.activities.toArray();
    expect(stored.map((a) => a.name)).toEqual(['Judo perso']);
  });

  it('swaps order when moving an activity down', async () => {
    const first = makeActivity({ name: 'Judo', order: 1 });
    const second = makeActivity({ name: 'BJJ', order: 2 });
    await db.activities.bulkAdd([first, second]);
    const user = userEvent.setup();

    render(<ActivitiesSettings />);
    await screen.findByText('Judo');
    await user.click(screen.getByRole('button', { name: 'Descendre Judo' }));

    const updated = await db.activities.toArray();
    expect(updated.find((a) => a.id === first.id)?.order).toBe(2);
    expect(updated.find((a) => a.id === second.id)?.order).toBe(1);
  });

  it('archives and unarchives an activity', async () => {
    const activity = makeActivity({ name: 'Judo' });
    await db.activities.add(activity);
    const user = userEvent.setup();

    render(<ActivitiesSettings />);
    await user.click(await screen.findByRole('button', { name: 'Archiver' }));

    expect(await screen.findByText('Archivée')).toBeInTheDocument();
    expect((await db.activities.get(activity.id))?.archived).toBe(true);
  });

  it('blocks deletion of a referenced activity with a clear error', async () => {
    const activity = makeActivity({ name: 'Judo' });
    await db.activities.add(activity);
    await db.sessions.add(makeSession({ activityId: activity.id }));
    const user = userEvent.setup();

    render(<ActivitiesSettings />);
    await user.click(await screen.findByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    expect(
      await screen.findByText('Activité utilisée par des séances : archive-la plutôt.'),
    ).toBeInTheDocument();
    expect(await db.activities.get(activity.id)).toBeDefined();
  });
});
