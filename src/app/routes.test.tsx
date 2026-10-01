import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from './routes';

const ROUTES: { path: string; heading: string }[] = [
  { path: '/plans', heading: 'Plans de jeu' },
  { path: '/plans/abc', heading: 'Plan de jeu' },
  { path: '/stats', heading: 'Stats' },
  { path: '/search', heading: 'Recherche' },
];

describe('AppRoutes', () => {
  it.each(ROUTES)('renders $path', ({ path, heading }) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByText(heading, { selector: 'p' })).toBeInTheDocument();
  });

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
    { path: '/settings', heading: 'Réglages' },
    { path: '/settings/activities', heading: 'Activités' },
    { path: '/settings/exercises', heading: 'Exercices' },
    { path: '/settings/goals', heading: 'Objectifs' },
    { path: '/settings/backup', heading: 'Sauvegarde' },
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
