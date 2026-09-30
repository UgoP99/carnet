import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useActivities, useSession, useSessions } from '@/db/hooks';
import { clearSessionDraft, getSessionDraft, setSessionDraft } from '@/db/metaRepo';
import { createSession } from '@/db/sessionRepo';
import { todayLocal } from '@/lib/dates';
import { SessionForm, sessionFormValuesSchema, sessionToFormValues } from './SessionForm';
import type { SessionFormValues } from './SessionForm';

export function NewSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activities = useActivities();
  const sessions = useSessions();
  const fromSession = useSession(searchParams.get('from') ?? undefined);
  const [initial, setInitial] = useState<SessionFormValues>();
  /** Chains draft writes so a later `clearSessionDraft()` can await them and always win the race. */
  const draftWriteRef = useRef<Promise<void>>(Promise.resolve());

  const activityParam = searchParams.get('activity');
  const dateParam = searchParams.get('date');
  const fromParam = searchParams.get('from');

  useEffect(() => {
    if (initial || sessions === undefined) return;
    const loadedSessions = sessions;

    async function loadInitial() {
      const today = todayLocal();

      if (fromParam) {
        if (!fromSession) return;
        setInitial(
          sessionToFormValues(
            { activityId: fromSession.activityId, durationMin: fromSession.durationMin },
            today,
          ),
        );
        return;
      }

      const draft = await getSessionDraft();
      const parsedDraft = sessionFormValuesSchema.safeParse(draft);
      if (parsedDraft.success) {
        setInitial(parsedDraft.data);
        return;
      }
      const lastSession = loadedSessions[0];
      setInitial(
        sessionToFormValues(
          {
            activityId: activityParam ?? lastSession?.activityId,
            date: dateParam ?? today,
            durationMin: lastSession?.durationMin,
          },
          today,
        ),
      );
    }

    void loadInitial();
  }, [initial, sessions, fromParam, fromSession, activityParam, dateParam]);

  if (!activities || !sessions || !initial) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouvelle séance</h1>
      <SessionForm
        activities={activities}
        sessions={sessions}
        initial={initial}
        submitLabel="Enregistrer"
        onValuesChange={(values) => {
          draftWriteRef.current = draftWriteRef.current.then(() => setSessionDraft(values));
        }}
        onSubmit={async (input) => {
          const created = await createSession(input);
          await draftWriteRef.current;
          await clearSessionDraft();
          void navigate(`/sessions/${created.id}`);
        }}
      />
    </div>
  );
}
