import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useActivities, useSession } from '@/db/hooks';
import { deleteSession } from '@/db/sessionRepo';
import { bodyZoneLabels, ENERGY_LABELS, PAIN_LEVEL_LABELS, RPE_LABELS } from '@/domain/labels';
import { sessionLoad } from '@/domain/load';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = useSession(id);
  const activities = useActivities();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string>();

  const activity = activities?.find((a) => a.id === session?.activityId);

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteSession(id);
      void navigate('/journal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Séance</h1>

      {session === undefined ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
      ) : (
        <>
          <div>
            <p className="text-lg font-medium text-slate-900 dark:text-white">
              {activity?.name ?? 'Activité supprimée'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {format(parseISO(session.date), 'EEEE d MMMM yyyy', { locale: fr })}
              {session.startTime && ` · ${session.startTime}`}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Durée</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {session.durationMin} min
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Intensité</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {session.rpe} — {RPE_LABELS[session.rpe]}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Charge</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {sessionLoad(session)} UA
              </dd>
            </div>
            {session.energy && (
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Énergie</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {ENERGY_LABELS[session.energy]}
                </dd>
              </div>
            )}
          </dl>

          {session.pains.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Douleurs</h2>
              <ul className="text-sm text-slate-900 dark:text-white">
                {session.pains.map((pain, i) => (
                  <li key={`${pain.zone}-${i}`}>
                    {bodyZoneLabels[pain.zone]} — {PAIN_LEVEL_LABELS[pain.level]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {session.notes && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Notes</h2>
              <p className="whitespace-pre-wrap break-words text-sm text-slate-900 dark:text-white">
                {session.notes}
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                void navigate(`/sessions/${id}/edit`);
              }}
            >
              Modifier
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void navigate(`/sessions/new?from=${id}`);
              }}
            >
              Refaire cette séance
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmingDelete(true);
              }}
            >
              Supprimer
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer la séance ?"
        description="Les techniques associées seront conservées mais détachées de cette séance."
        destructive
        confirmLabel="Supprimer"
        onConfirm={() => {
          setConfirmingDelete(false);
          void handleDelete();
        }}
        onCancel={() => {
          setConfirmingDelete(false);
        }}
      />
    </div>
  );
}
