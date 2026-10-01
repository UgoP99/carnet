import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/db/db';
import {
  makeActivity,
  makeExercise,
  makeExerciseEntry,
  makeSession,
  makeSetEntry,
} from '@/test/factories';
import { StatsView } from './StatsView';

beforeEach(async () => {
  await db.delete();
  await db.open();
  vi.setSystemTime(new Date('2026-10-01T10:00:00.000Z')); // Thursday, ISO week 2026-W40
});

describe('StatsView', () => {
  it('shows a friendly empty state when there are no sessions', async () => {
    render(
      <MemoryRouter>
        <StatsView />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Stats' })).toBeInTheDocument();
    expect(screen.getByText('Pas encore de stats')).toBeInTheDocument();
  });

  it('renders the charts and accessible tables from real data', async () => {
    const judo = makeActivity({ name: 'Judo perso', category: 'grappling' });
    await db.activities.add(judo);
    await db.sessions.add(
      makeSession({ activityId: judo.id, date: '2026-09-28', durationMin: 60, rpe: 5 }),
    );

    render(
      <MemoryRouter>
        <StatsView />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: 'Stats' });
    expect(screen.getByText('Judo perso')).toBeInTheDocument(); // minutes-per-activity bar
    expect(screen.getByRole('table', { name: /Charge hebdomadaire/ })).toBeInTheDocument();
  });

  it('shows e1RM progression for a selected exercise', async () => {
    const activity = makeActivity({ category: 'strength' });
    await db.activities.add(activity);
    const session = makeSession({ activityId: activity.id, date: '2026-09-28' });
    await db.sessions.add(session);
    const exercise = makeExercise({ name: 'Squat', metric: 'weight_reps' });
    await db.exercises.add(exercise);
    await db.exerciseEntries.add(
      makeExerciseEntry({
        sessionId: session.id,
        exerciseId: exercise.id,
        date: '2026-09-28',
        sets: [makeSetEntry({ weightKg: 100, reps: 5 })],
      }),
    );

    render(
      <MemoryRouter initialEntries={[`/stats?ex=${exercise.id}`]}>
        <StatsView />
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue('Squat')).toBeInTheDocument();
    expect(await screen.findByText(/Dernier : 116.5 kg/)).toBeInTheDocument();
  });
});
