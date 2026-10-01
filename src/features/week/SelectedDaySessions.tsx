import { Link } from 'react-router';
import { sessionLoad } from '@/domain/load';
import type { Activity, Session } from '@/domain/schemas';

export function SelectedDaySessions({
  sessions,
  activityById,
  activityColorById,
}: {
  sessions: Session[];
  activityById: Map<string, Activity>;
  activityColorById: Map<string, string>;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link
            to={`/sessions/${s.id}`}
            className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${activityColorById.get(s.activityId) ?? 'bg-slate-400'}`}
            />
            <span className="text-slate-900 dark:text-white">
              {activityById.get(s.activityId)?.name ?? 'Activité supprimée'}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {s.durationMin} min · RPE {s.rpe} · {sessionLoad(s)} UA
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
