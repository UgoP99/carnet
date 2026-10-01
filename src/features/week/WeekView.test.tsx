import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/db/db';
import { saveSettings } from '@/db/metaRepo';
import { makeActivity, makeSession } from '@/test/factories';
import { WeekView } from './WeekView';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('WeekView', () => {
  it('shows totals, activity breakdown and trend for the current week', async () => {
    vi.setSystemTime(new Date('2026-10-01T10:00:00.000Z')); // Thursday, ISO week 2026-W40
    const judo = makeActivity({ name: 'Judo perso' });
    await db.activities.add(judo);
    await db.sessions.bulkAdd([
      makeSession({ activityId: judo.id, date: '2026-09-28', durationMin: 60, rpe: 5 }), // this week
      makeSession({ activityId: judo.id, date: '2026-09-21', durationMin: 60, rpe: 5 }), // previous week
    ]);

    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Semaine' })).toBeInTheDocument();
    expect(screen.getByText('1', { selector: 'p' })).toBeInTheDocument(); // sessions
    expect(screen.getByText('60', { selector: 'p' })).toBeInTheDocument(); // minutes
    expect(screen.getByText('300', { selector: 'p' })).toBeInTheDocument(); // load
    expect(screen.getByText(/Judo perso/)).toBeInTheDocument();
  });

  it('shows a friendly empty state for a week with no sessions', async () => {
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Aucune séance cette semaine')).toBeInTheDocument();
  });

  it('navigates to the previous week across a year boundary', async () => {
    vi.setSystemTime(new Date('2026-01-02T10:00:00.000Z')); // Friday, ISO week 2026-W01
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: 'Semaine' });
    await user.click(screen.getByRole('button', { name: 'Semaine précédente' }));

    expect(await screen.findByText(/Semaine du 22 déc\. au 28 déc\./)).toBeInTheDocument();
  });

  it('shows goal progress bars when goals are configured', async () => {
    vi.setSystemTime(new Date('2026-10-01T10:00:00.000Z'));
    const judo = makeActivity({ name: 'Judo perso' });
    await db.activities.add(judo);
    await db.sessions.add(
      makeSession({ activityId: judo.id, date: '2026-09-28', durationMin: 60, rpe: 5 }),
    );
    await saveSettings({
      goals: { weeklyMinutes: 120, perActivity: [{ activityId: judo.id, sessionsPerWeek: 3 }] },
      backupReminderDays: 14,
    });

    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Objectifs' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Minutes cette semaine' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    );
    expect(screen.getByRole('progressbar', { name: 'Judo perso' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
  });
});
