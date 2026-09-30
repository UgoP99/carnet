import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from './routes';

describe('Layout', () => {
  it('navigates between tabs', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText('Semaine', { selector: 'p' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /journal/i }));
    expect(await screen.findByRole('heading', { name: 'Journal' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Rechercher' }));
    expect(screen.getByText('Recherche', { selector: 'p' })).toBeInTheDocument();
  });
});
