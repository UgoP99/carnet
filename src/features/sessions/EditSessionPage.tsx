import { useNavigate, useParams } from 'react-router';
import {
  useActivities,
  useSession,
  useSessionTechniqueLogs,
  useSessions,
  useTechniques,
} from '@/db/hooks';
import { updateSession } from '@/db/sessionRepo';
import { syncSessionTechniqueLogs } from '@/db/techniqueLogRepo';
import { todayLocal } from '@/lib/dates';
import { SessionForm, sessionToFormValues } from './SessionForm';
import type { TechniqueLogDraft } from './SessionForm';

export function EditSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activities = useActivities();
  const sessions = useSessions();
  const techniques = useTechniques();
  const session = useSession(id);
  const logs = useSessionTechniqueLogs(id);

  const initialTechniqueLogs: TechniqueLogDraft[] | undefined =
    logs && techniques
      ? logs.map((log) => ({
          logId: log.id,
          techniqueId: log.techniqueId,
          techniqueName: techniques.find((t) => t.id === log.techniqueId)?.name ?? '?',
          text: log.text ?? '',
        }))
      : undefined;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Modifier la séance</h1>
      {!activities || !sessions || !techniques || !session || !id || !initialTechniqueLogs ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : (
        <SessionForm
          activities={activities}
          sessions={sessions}
          techniques={techniques}
          initial={sessionToFormValues(session, todayLocal(), initialTechniqueLogs)}
          submitLabel="Mettre à jour"
          onSubmit={async (input, techniqueLogs) => {
            const updated = await updateSession(id, input);
            await syncSessionTechniqueLogs(
              id,
              updated.date,
              techniqueLogs.map((l) => ({
                id: l.logId,
                techniqueId: l.techniqueId,
                text: l.text,
              })),
            );
            void navigate(`/sessions/${id}`);
          }}
        />
      )}
    </div>
  );
}
