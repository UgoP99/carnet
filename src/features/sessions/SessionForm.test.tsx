import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeActivity, makeTechnique } from '@/test/factories';
import { SessionForm, sessionToFormValues } from './SessionForm';

const activity = makeActivity({ name: 'JJB' });
const strengthActivity = makeActivity({ name: 'Muscu', category: 'strength' });

describe('SessionForm', () => {
  it('rejects submit without an activity and RPE, showing inline errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SessionForm
        activities={[activity]}
        sessions={[]}
        techniques={[]}
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
        activities={[strengthActivity]}
        sessions={[]}
        techniques={[]}
        initial={sessionToFormValues({}, '2026-09-30')}
        submitLabel="Enregistrer"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Muscu' }));
    await user.click(screen.getByRole('button', { name: '75' }));
    await user.click(screen.getByRole('radio', { name: '6' }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: strengthActivity.id, durationMin: 75, rpe: 6 }),
      [],
    );
  });

  it('reports the current values on every change for draft autosave', async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(
      <SessionForm
        activities={[activity]}
        sessions={[]}
        techniques={[]}
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

  it('shows the grappling block only for a grappling activity', async () => {
    const user = userEvent.setup();
    render(
      <SessionForm
        activities={[activity, strengthActivity]}
        sessions={[]}
        techniques={[]}
        initial={sessionToFormValues({}, '2026-09-30')}
        submitLabel="Enregistrer"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText('Techniques vues')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'JJB' }));
    expect(screen.getByText('Techniques vues')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Muscu' }));
    expect(screen.queryByText('Techniques vues')).not.toBeInTheDocument();
  });

  it('attaches a searched technique as a TechniqueLogDraft on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const technique = makeTechnique({ name: 'Armbar from closed guard' });
    render(
      <SessionForm
        activities={[activity]}
        sessions={[]}
        techniques={[technique]}
        initial={sessionToFormValues({ activityId: activity.id, durationMin: 60 }, '2026-09-30')}
        submitLabel="Enregistrer"
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole('radio', { name: '6' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Rechercher ou créer une technique' }),
      'Armbar',
    );
    await user.click(screen.getByRole('button', { name: /Armbar from closed guard/ }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({ techniqueId: technique.id, techniqueName: technique.name }),
      ]),
    );
  });
});
