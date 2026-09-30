import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Carnet' })).toBeInTheDocument();
  });

  it('has IndexedDB available in tests (fake-indexeddb)', () => {
    expect(globalThis.indexedDB).toBeDefined();
  });
});
