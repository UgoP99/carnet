import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  useActivities,
  useGamePlans,
  useSessions,
  useTechniqueLogs,
  useTechniques,
} from '@/db/hooks';
import { search } from '@/domain/search';
import type { GamePlan, Session, Technique, TechniqueLog } from '@/domain/schemas';
import { EmptyState } from '@/ui/EmptyState';
import { Highlight } from '@/ui/Highlight';

const DEBOUNCE_MS = 200;

function useDebounced(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);
  return debounced;
}

function ResultGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="flex flex-col gap-1">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {title} ({count})
      </h2>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
}

function RowLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex min-h-11 flex-col justify-center gap-0.5 rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
    >
      {children}
    </Link>
  );
}

export function SearchView() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, DEBOUNCE_MS);

  const sessions = useSessions();
  const activities = useActivities();
  const techniques = useTechniques();
  const techniqueLogs = useTechniqueLogs();
  const gamePlans = useGamePlans();

  const activityById = useMemo(
    () => new Map((activities ?? []).map((a) => [a.id, a])),
    [activities],
  );
  const techniqueById = useMemo(
    () => new Map((techniques ?? []).map((t) => [t.id, t])),
    [techniques],
  );

  const loading =
    sessions === undefined ||
    activities === undefined ||
    techniques === undefined ||
    techniqueLogs === undefined ||
    gamePlans === undefined;

  const results = useMemo(
    () =>
      loading
        ? undefined
        : search(debouncedQuery, { sessions, techniques, techniqueLogs, gamePlans }),
    [loading, debouncedQuery, sessions, techniques, techniqueLogs, gamePlans],
  );

  const totalResults = results
    ? results.sessions.length +
      results.techniques.length +
      results.techniqueLogs.length +
      results.gamePlans.length
    : 0;

  return (
    <div className="flex flex-col gap-4 pb-20">
      <h1 className="text-xl font-semibold">Recherche</h1>

      <input
        type="text"
        aria-label="Rechercher"
        placeholder="Rechercher dans séances, techniques, plans…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />

      {!debouncedQuery.trim() ? (
        <EmptyState
          icon={SearchIcon}
          title="Cherche dans ton carnet"
          description="Séances, techniques, notes et plans de jeu."
        />
      ) : loading || !results ? null : totalResults === 0 ? (
        <EmptyState icon={SearchIcon} title="Aucun résultat" description="Essaie un autre mot." />
      ) : (
        <>
          <ResultGroup title="Séances" count={results.sessions.length}>
            {results.sessions.map((s) => (
              <SessionResultRow
                key={s.id}
                session={s}
                activityName={activityById.get(s.activityId)?.name}
                query={debouncedQuery}
              />
            ))}
          </ResultGroup>

          <ResultGroup title="Techniques" count={results.techniques.length}>
            {results.techniques.map((t) => (
              <TechniqueResultRow key={t.id} technique={t} query={debouncedQuery} />
            ))}
          </ResultGroup>

          <ResultGroup title="Détails de technique" count={results.techniqueLogs.length}>
            {results.techniqueLogs.map((log) => (
              <TechniqueLogResultRow
                key={log.id}
                log={log}
                techniqueName={techniqueById.get(log.techniqueId)?.name}
                query={debouncedQuery}
              />
            ))}
          </ResultGroup>

          <ResultGroup title="Plans de jeu" count={results.gamePlans.length}>
            {results.gamePlans.map((p) => (
              <GamePlanResultRow key={p.id} plan={p} query={debouncedQuery} />
            ))}
          </ResultGroup>
        </>
      )}
    </div>
  );
}

function SessionResultRow({
  session,
  activityName,
  query,
}: {
  session: Session;
  activityName: string | undefined;
  query: string;
}) {
  const snippet = session.notes || session.grappling?.partners.join(', ') || '';
  return (
    <RowLink to={`/sessions/${session.id}`}>
      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
        {activityName ?? 'Activité supprimée'} ·{' '}
        {format(parseISO(session.date), 'EEE d MMM yyyy', { locale: fr })}
      </p>
      {snippet && (
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          <Highlight text={snippet} query={query} />
        </p>
      )}
    </RowLink>
  );
}

function TechniqueResultRow({ technique, query }: { technique: Technique; query: string }) {
  return (
    <RowLink to={`/techniques/${technique.id}`}>
      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
        <Highlight text={technique.name} query={query} />
      </p>
      {technique.summary && (
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          <Highlight text={technique.summary} query={query} />
        </p>
      )}
    </RowLink>
  );
}

function TechniqueLogResultRow({
  log,
  techniqueName,
  query,
}: {
  log: TechniqueLog;
  techniqueName: string | undefined;
  query: string;
}) {
  return (
    <RowLink to={`/techniques/${log.techniqueId}`}>
      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
        {techniqueName ?? 'Technique supprimée'} ·{' '}
        {format(parseISO(log.date), 'EEE d MMM yyyy', { locale: fr })}
      </p>
      {log.text && (
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          <Highlight text={log.text} query={query} />
        </p>
      )}
    </RowLink>
  );
}

function GamePlanResultRow({ plan, query }: { plan: GamePlan; query: string }) {
  return (
    <RowLink to={`/plans/${plan.id}`}>
      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
        <Highlight text={plan.name} query={query} />
      </p>
      {plan.description && (
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          <Highlight text={plan.description} query={query} />
        </p>
      )}
    </RowLink>
  );
}
