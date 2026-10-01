import type { ReactNode } from 'react';
import { parseHttpsUrl } from '@/lib/url';

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/** Renders nothing if `href` isn't a valid https URL — defense in depth against bad stored data. */
export function SafeLink({ href, children, className }: SafeLinkProps) {
  const safeHref = parseHttpsUrl(href);
  if (!safeHref) return null;
  return (
    <a href={safeHref} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
