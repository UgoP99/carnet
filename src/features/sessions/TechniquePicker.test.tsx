import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeTechnique } from '@/test/factories';
import { TechniquePicker } from './TechniquePicker';

describe('TechniquePicker', () => {
  it('hides archived techniques from search results', async () => {
    const active = makeTechnique({ name: 'Armbar from guard' });
    const archived = makeTechnique({ name: 'Armbar from mount', archived: true });
    const onChange = vi.fn();

    render(<TechniquePicker techniques={[active, archived]} logs={[]} onChange={onChange} />);
    const user = userEvent.setup();

    await user.type(
      screen.getByRole('textbox', { name: 'Rechercher ou créer une technique' }),
      'Armbar',
    );

    expect(screen.getByRole('button', { name: /Armbar from guard/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Armbar from mount/ })).not.toBeInTheDocument();
  });
});
