import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Segmented } from './Segmented';

const OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
];

describe('Segmented', () => {
  it('reports the selected option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Segmented options={OPTIONS} value="kg" onChange={onChange} aria-label="Unité" />);

    expect(screen.getByRole('radio', { name: 'kg' })).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('radio', { name: 'lb' }));

    expect(onChange).toHaveBeenCalledWith('lb');
  });
});
