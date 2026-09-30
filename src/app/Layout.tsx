import { Calendar, GitBranch, NotebookText, Search, Settings, Swords } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
}

const TABS: Tab[] = [
  { to: '/', label: 'Semaine', icon: Calendar, end: true },
  { to: '/journal', label: 'Journal', icon: NotebookText, end: false },
  { to: '/techniques', label: 'Techniques', icon: Swords, end: false },
  { to: '/plans', label: 'Plans', icon: GitBranch, end: false },
  { to: '/settings', label: 'Réglages', icon: Settings, end: false },
];

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 dark:border-slate-800">
        <span className="text-lg font-semibold">Carnet</span>
        <NavLink
          to="/search"
          aria-label="Rechercher"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:hover:bg-slate-800"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </NavLink>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <Outlet />
      </main>

      <nav
        aria-label="Navigation principale"
        className="flex border-t border-slate-200 bg-white pb-[max(env(safe-area-inset-bottom),0.5rem)] dark:border-slate-800 dark:bg-slate-950"
      >
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-11 flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-500 ${
                isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
