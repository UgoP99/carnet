import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router';
import { useLastExportAt } from '@/db/hooks';
import { formatExportDate } from './formatExportDate';

const LINKS: { to: string; label: string }[] = [
  { to: '/settings/activities', label: 'Activités' },
  { to: '/settings/exercises', label: 'Exercices' },
  { to: '/settings/goals', label: 'Objectifs' },
  { to: '/settings/backup', label: 'Sauvegarde' },
];

export function Settings() {
  const lastExportAt = useLastExportAt();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Réglages</h1>

      <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
        {LINKS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className="flex min-h-11 items-center justify-between gap-2 py-3 text-sm font-medium text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:text-white"
            >
              <span>
                {label}
                {to === '/settings/backup' && (
                  <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                    Dernier export : {formatExportDate(lastExportAt)}
                  </span>
                )}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
