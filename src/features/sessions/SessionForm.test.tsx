import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeActivity } from '@/test/factories';
import { SessionForm, sessionToFormValues } from './SessionForm';

const activity = makeActivity({ name: 'JJB' });

describe('SessionForm', () => {
  it('rejects submit without an activity and RPE, showing inline errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SessionForm
        activities={[activity]}
        sessions={[]}
        initial={sessionToFormValues({ durationMin: 60 }, '2026-09-30')}
        submitLabel="Enregistrer"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('submits a valid session with the base fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <SessionForm
        activities={[activity]}
        sessions={[]}
        initial={sessionToFormValues({}, '2026-09-30')}
        submitLabel="Enregistrer"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'JJB' }));
    await user.click(screen.getByRole('button', { name: '75' }));
    await user.click(screen.getByRole('radio', { name: '6' }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: activity.id, durationMin: 75, rpe: 6 }),
    );
  });

  it('reports the current values on every change for draft autosave', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(
      <SessionForm
        activities={[activity]}
        sessions={[]}
        initial={sessionToFormValues({}, '2026-09-30')}
        submitLabel="Enregistrer"
        onSubmit={vi.fn()}
        onValuesChange={onValuesChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'JJB' }));

    expect(onValuesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ activityId: activity.id }),
    );
  });
});
