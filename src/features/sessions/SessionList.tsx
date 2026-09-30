import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotebookText, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useActivities, useSessions } from '@/db/hooks';
import { sessionLoad } from '@/domain/load';
import { activityColorClasses } from '@/domain/labels';
import type { Activity, Session } from '@/domain/schemas';
import { isoWeekKey, weekRange } from '@/lib/dates';
import { Button } from '@/ui/Button';
import { Chips } from '@/ui/Chips';
import { EmptyState } from '@/ui/EmptyState';

const PAGE_SIZE = 20;

function groupByWeek(sessions: Session[]): { weekKey: string; sessions: Session[] }[] {
  const groups = new Map<string, Session[]>();
  for (const session of sessions) {
    const key = isoWeekKey(session.date);
    const list = groups.get(key);
    if (list) {
      list.push(session);
    } else {
      groups.set(key, [session]);
    }
  }
  return Array.from(groups, ([weekKey, list]) => ({ weekKey, sessions: list }));
}

function weekLabel(weekKey: string): string {
  const { start, end } = weekRange(weekKey);
  return `Semaine du ${format(parseISO(start), 'd MMM', { locale: fr })} au ${format(parseISO(end), 'd MMM', { locale: fr })}`;
}

function SessionRow({ session, activity }: { session: Session; activity: Activity | undefined }) {
  const firstNoteLine = session.notes?.split('\n')[0];
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
    >
      <span
        aria-hidden="true"
        className={`h-3 w-3 shrink-0 rounded-full ${activity ? activityColorClasses[activity.color] : 'bg-slate-300'}`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
          {activity?.name ?? 'Activité supprimée'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {format(parseISO(session.date), 'EEE d MMM', { locale: fr })} · {session.durationMin} min
          · RPE {session.rpe} · {sessionLoad(session)} UA
        </p>
        {firstNoteLine && (
          <p className="truncate text-xs text-slate-400 dark:text-slate-500">{firstNoteLine}</p>
        )}
      </div>
    </Link>
  );
}

export function SessionList() {
  const sessions = useSessions();
  const activities = useActivities();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const activityFilter = searchParams.get('activity') ?? '';

  const activityById = useMemo(
    () => new Map((activities ?? []).map((a) => [a.id, a])),
    [activities],
  );

  const filtered = useMemo(
    () => (sessions ?? []).filter((s) => !activityFilter || s.activityId === activityFilter),
    [sessions, activityFilter],
  );
  const visible = filtered.slice(0, visibleCount);
  const groups = useMemo(() => groupByWeek(visible), [visible]);

  if (sessions === undefined || activities === undefined) return null;

  return (
    <div className="flex flex-col gap-4 pb-20">
      <h1 className="text-xl font-semibold">Journal</h1>

      <Chips
        aria-label="Filtrer par activité"
        options={[
          { value: '', label: 'Toutes' },
          ...activities.filter((a) => !a.archived).map((a) => ({ value: a.id, label: a.name })),
        ]}
        value={[activityFilter]}
        onChange={(v) => {
          const next = v[0] ?? '';
          setSearchParams(next ? { activity: next } : {});
          setVisibleCount(PAGE_SIZE);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={NotebookText}
          title="Aucune séance"
          description="Ajoute ta première séance avec le bouton +."
        />
      ) : (
        groups.map(({ weekKey, sessions: weekSessions }) => (
          <section key={weekKey} className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {weekLabel(weekKey)}
            </h2>
            {weekSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                activity={activityById.get(session.activityId)}
              />
            ))}
          </section>
        ))
      )}

      {visibleCount < filtered.length && (
        <Button
          variant="secondary"
          onClick={() => {
            setVisibleCount((c) => c + PAGE_SIZE);
          }}
        >
          Charger plus
        </Button>
      )}

      <Link
        to="/sessions/new"
        aria-label="Nouvelle séance"
        className="fixed bottom-[max(calc(env(safe-area-inset-bottom)+4.5rem),5rem)] right-4 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-500"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </Link>
    </div>
  );
}
