import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RpeInput } from './RpeInput';

describe('RpeInput', () => {
  it('reports the selected value and label', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RpeInput value={undefined} onChange={onChange} label="Intensité" />);

    await user.click(screen.getByRole('radio', { name: '7' }));

    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('shows the CR-10 label for the selected value', () => {
    render(<RpeInput value={3} onChange={vi.fn()} label="Intensité" />);
    expect(screen.getByText('Modéré')).toBeInTheDocument();
  });
});
