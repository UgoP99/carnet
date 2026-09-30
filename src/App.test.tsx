import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the app shell with the default route', () => {
    render(<App />);
    expect(screen.getByText('Carnet')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toBeInTheDocument();
    expect(screen.getByText('Semaine', { selector: 'p' })).toBeInTheDocument();
  });

  it('has IndexedDB available in tests (fake-indexeddb)', () => {
    expect(globalThis.indexedDB).toBeDefined();
  });
});
