import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('increments and decrements by step', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stepper value={3} onChange={onChange} label="reps" />);

    await user.click(screen.getByRole('button', { name: 'Augmenter reps' }));
    expect(onChange).toHaveBeenCalledWith(4);

    await user.click(screen.getByRole('button', { name: 'Diminuer reps' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables the decrement button at the min bound', () => {
    render(<Stepper value={0} onChange={vi.fn()} min={0} label="reps" />);

    expect(screen.getByRole('button', { name: 'Diminuer reps' })).toBeDisabled();
  });
});
