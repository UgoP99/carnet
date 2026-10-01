import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the app shell with the default route', async () => {
    render(<App />);
    expect(screen.getByText('Carnet')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Semaine' })).toBeInTheDocument();
  });

  it('has IndexedDB available in tests (fake-indexeddb)', () => {
    expect(globalThis.indexedDB).toBeDefined();
  });
});
