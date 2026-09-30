import { useNavigate, useParams } from 'react-router';
import { useActivities, useSession, useSessions } from '@/db/hooks';
import { updateSession } from '@/db/sessionRepo';
import { todayLocal } from '@/lib/dates';
import { SessionForm, sessionToFormValues } from './SessionForm';

export function EditSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activities = useActivities();
  const sessions = useSessions();
  const session = useSession(id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Modifier la séance</h1>
      {!activities || !sessions || !session || !id ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : (
        <SessionForm
          activities={activities}
          sessions={sessions}
          initial={sessionToFormValues(session, todayLocal())}
          submitLabel="Mettre à jour"
          onSubmit={async (input) => {
            await updateSession(id, input);
            void navigate(`/sessions/${id}`);
          }}
        />
      )}
    </div>
  );
}
