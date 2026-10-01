import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/db/db';
import { makeActivity } from '@/test/factories';
import { GoalsSettings } from './GoalsSettings';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('GoalsSettings', () => {
  it('saves weekly minutes and per-activity session goals', async () => {
    const activity = makeActivity({ name: 'Judo perso' });
    await db.activities.add(activity);
    const user = userEvent.setup();

    render(<GoalsSettings />);

    const minutesInput = await screen.findByLabelText('Minutes par semaine (optionnel)');
    await user.clear(minutesInput);
    await user.type(minutesInput, '150');

    await user.click(screen.getByRole('button', { name: `Augmenter ${activity.name}` }));
    await user.click(screen.getByRole('button', { name: `Augmenter ${activity.name}` }));

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Enregistré.')).toBeInTheDocument();
    const saved = await db.meta.get('settings');
    expect(saved?.value).toMatchObject({
      goals: {
        weeklyMinutes: 150,
        perActivity: [{ activityId: activity.id, sessionsPerWeek: 2 }],
      },
    });
  });
});
