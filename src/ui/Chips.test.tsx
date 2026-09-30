import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Chips } from './Chips';

const OPTIONS = [
  { value: 'bjj', label: 'BJJ' },
  { value: 'wrestling', label: 'Lutte' },
];

describe('Chips', () => {
  it('replaces the selection in single mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Chips options={OPTIONS} value={['bjj']} onChange={onChange} aria-label="Activité" />);

    await user.click(screen.getByRole('button', { name: 'Lutte' }));

    expect(onChange).toHaveBeenCalledWith(['wrestling']);
  });

  it('toggles independently in multi mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Chips options={OPTIONS} value={['bjj']} onChange={onChange} multi aria-label="Activités" />,
    );

    await user.click(screen.getByRole('button', { name: 'Lutte' }));
    expect(onChange).toHaveBeenCalledWith(['bjj', 'wrestling']);

    await user.click(screen.getByRole('button', { name: 'BJJ' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
