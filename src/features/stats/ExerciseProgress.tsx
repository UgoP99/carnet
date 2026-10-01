import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { E1rmPoint } from '@/domain/strength';
import type { Exercise } from '@/domain/schemas';
import { Field } from '@/ui/Field';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 90;
const PAD_Y = 8;

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

function pointPosition(index: number, count: number, value: number, min: number, max: number) {
  const x = count > 1 ? (index / (count - 1)) * CHART_WIDTH : CHART_WIDTH / 2;
  const usableHeight = CHART_HEIGHT - 2 * PAD_Y;
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  const y = PAD_Y + usableHeight - ratio * usableHeight;
  return { x, y };
}

/** e1RM progression for one exercise: picker + line chart, with an accessible table fallback. */
export function ExerciseProgress({
  exercises,
  selectedId,
  onSelect,
  points,
}: {
  exercises: Exercise[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
  points: E1rmPoint[];
}) {
  const eligible = exercises.filter((e) => e.metric === 'weight_reps' && !e.archived);
  const values = points.map((p) => p.value);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;

  const lastPoint = points[points.length - 1];

  const linePoints = points
    .map((p, i) => {
      const { x, y } = pointPosition(i, points.length, p.value, min, max);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col gap-3">
      <Field label="Exercice" htmlFor="stats-exercise">
        <select
          id="stats-exercise"
          value={selectedId ?? ''}
          onChange={(e) => {
            onSelect(e.target.value || undefined);
          }}
          className={inputClass}
        >
          <option value="">Choisir un exercice…</option>
          {eligible.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </Field>

      {eligible.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aucun exercice à charge/reps enregistré.
        </p>
      )}

      {selectedId && points.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pas encore de données pour cet exercice.
        </p>
      )}

      {lastPoint && (
        <>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full"
            role="img"
            aria-label={`Progression du e1RM pour ${eligible.find((e) => e.id === selectedId)?.name ?? ''}`}
          >
            <polyline
              points={linePoints}
              className="fill-none stroke-sky-600 dark:stroke-sky-400"
              strokeWidth="2"
            />
            {points.map((p, i) => {
              const { x, y } = pointPosition(i, points.length, p.value, min, max);
              return (
                <circle
                  key={p.sessionId}
                  cx={x}
                  cy={y}
                  r={2.5}
                  className="fill-sky-600 dark:fill-sky-400"
                />
              );
            })}
          </svg>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dernier : {lastPoint.value} kg le{' '}
            {format(parseISO(lastPoint.date), 'd MMM yyyy', { locale: fr })}
          </p>

          <table className="sr-only">
            <caption>Progression du e1RM</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">e1RM (kg)</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.sessionId}>
                  <th scope="row">{format(parseISO(p.date), 'd MMM yyyy', { locale: fr })}</th>
                  <td>{p.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
