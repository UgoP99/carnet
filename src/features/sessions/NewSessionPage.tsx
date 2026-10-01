import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  useActivities,
  useExercises,
  useSession,
  useSessionExerciseEntries,
  useSessions,
  useTechniques,
} from '@/db/hooks';
import { syncSessionExerciseEntries } from '@/db/exerciseEntryRepo';
import { clearSessionDraft, getSessionDraft, setSessionDraft } from '@/db/metaRepo';
import { createSession } from '@/db/sessionRepo';
import { syncSessionTechniqueLogs } from '@/db/techniqueLogRepo';
import { todayLocal } from '@/lib/dates';
import { exerciseEntriesToDrafts, exerciseEntryDraftsToRepoInput } from './exerciseEntryConversion';
import { SessionForm, sessionFormValuesSchema, sessionToFormValues } from './SessionForm';
import type { SessionFormValues } from './SessionForm';

export function NewSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activities = useActivities();
  const sessions = useSessions();
  const techniques = useTechniques();
  const exercises = useExercises();
  const fromSession = useSession(searchParams.get('from') ?? undefined);
  const fromExerciseEntries = useSessionExerciseEntries(searchParams.get('from') ?? undefined);
  const [initial, setInitial] = useState<SessionFormValues>();
  /** Chains draft writes so a later `clearSessionDraft()` can await them and always win the race. */
  const draftWriteRef = useRef<Promise<void>>(Promise.resolve());

  const activityParam = searchParams.get('activity');
  const dateParam = searchParams.get('date');
  const fromParam = searchParams.get('from');

  useEffect(() => {
    if (initial || sessions === undefined || exercises === undefined) return;
    const loadedSessions = sessions;
    const loadedExercises = exercises;

    async function loadInitial() {
      const today = todayLocal();

      if (fromParam) {
        if (!fromSession || !fromExerciseEntries) return;
        setInitial(
          sessionToFormValues(
            {
              activityId: fromSession.activityId,
              durationMin: fromSession.durationMin,
              grappling: fromSession.grappling,
            },
            today,
            [],
            exerciseEntriesToDrafts(fromExerciseEntries, loadedExercises, false),
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
  }, [
    initial,
    sessions,
    exercises,
    fromParam,
    fromSession,
    fromExerciseEntries,
    activityParam,
    dateParam,
  ]);

  if (!activities || !sessions || !techniques || !exercises || !initial) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nouvelle séance</h1>
      <SessionForm
        activities={activities}
        sessions={sessions}
        techniques={techniques}
        exercises={exercises}
        initial={initial}
        submitLabel="Enregistrer"
        onValuesChange={(values) => {
          draftWriteRef.current = draftWriteRef.current.then(() => setSessionDraft(values));
        }}
        onSubmit={async (input, techniqueLogs, exerciseEntries) => {
          const created = await createSession(input);
          await syncSessionTechniqueLogs(
            created.id,
            created.date,
            techniqueLogs.map((l) => ({ id: l.logId, techniqueId: l.techniqueId, text: l.text })),
          );
          await syncSessionExerciseEntries(
            created.id,
            created.date,
            exerciseEntryDraftsToRepoInput(exerciseEntries),
          );
          await draftWriteRef.current;
          await clearSessionDraft();
          void navigate(`/sessions/${created.id}`);
        }}
      />
    </div>
  );
}
