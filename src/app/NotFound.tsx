import { Home } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '@/ui/EmptyState';

export function NotFound() {
  return (
    <EmptyState
      icon={Home}
      title="Page introuvable"
      description="Cette page n'existe pas ou plus."
      action={
        <Link
          to="/"
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white"
        >
          Retour à l'accueil
        </Link>
      }
    />
  );
}
