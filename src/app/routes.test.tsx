import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from './routes';

describe('AppRoutes', () => {
  const HEADING_ROUTES: { path: string; heading: string }[] = [
    { path: '/', heading: 'Semaine' },
    { path: '/journal', heading: 'Journal' },
    { path: '/sessions/new', heading: 'Nouvelle séance' },
    { path: '/sessions/abc', heading: 'Séance' },
    { path: '/sessions/abc/edit', heading: 'Modifier la séance' },
    { path: '/techniques', heading: 'Techniques' },
    { path: '/techniques/new', heading: 'Nouvelle technique' },
    { path: '/techniques/abc', heading: 'Technique' },
    { path: '/techniques/abc/edit', heading: 'Modifier la technique' },
    { path: '/plans', heading: 'Plans de jeu' },
    { path: '/plans/abc', heading: 'Plan de jeu' },
    { path: '/search', heading: 'Recherche' },
    { path: '/settings', heading: 'Réglages' },
    { path: '/settings/activities', heading: 'Activités' },
    { path: '/settings/exercises', heading: 'Exercices' },
    { path: '/settings/goals', heading: 'Objectifs' },
    { path: '/settings/backup', heading: 'Sauvegarde' },
    { path: '/settings/about', heading: 'À propos' },
  ];

  it.each(HEADING_ROUTES)('renders $path', async ({ path, heading }) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('renders a not-found screen for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/nope']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText('Page introuvable')).toBeInTheDocument();
  });
});
