import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SafeLink } from './SafeLink';

describe('SafeLink', () => {
  it('renders an https link with noopener noreferrer', () => {
    render(<SafeLink href="https://example.com/video">Voir</SafeLink>);
    const link = screen.getByRole('link', { name: 'Voir' });
    expect(link).toHaveAttribute('href', 'https://example.com/video');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders nothing for a non-https URL', () => {
    render(<SafeLink href="http://example.com">Voir</SafeLink>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
