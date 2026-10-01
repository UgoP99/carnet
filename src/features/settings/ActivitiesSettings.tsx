import { useState } from 'react';
import { useActivities } from '@/db/hooks';
import { createActivity, updateActivity } from '@/db/activityRepo';
import {
  ACTIVITY_CATEGORIES,
  activityCategoryLabels,
  type ActivityCategory,
  type ActivityColor,
} from '@/domain/labels';
import type { Activity } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { ActivityRow } from './ActivityRow';
import { ColorPicker } from './ColorPicker';

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

async function moveActivity(activity: Activity, direction: -1 | 1, ordered: Activity[]) {
  const index = ordered.findIndex((a) => a.id === activity.id);
  const swapWith = ordered[index + direction];
  if (!swapWith) return;
  await Promise.all([
    updateActivity(activity.id, { order: swapWith.order }),
    updateActivity(swapWith.id, { order: activity.order }),
  ]);
}

export function ActivitiesSettings() {
  const activities = useActivities();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('other');
  const [color, setColor] = useState<ActivityColor>('slate');

  async function addActivity() {
    const trimmed = name.trim();
    if (!trimmed || !activities) return;
    const order = activities.length === 0 ? 1 : Math.max(...activities.map((a) => a.order)) + 1;
    await createActivity({ name: trimmed, category, order, color });
    setName('');
    setCategory('other');
    setColor('slate');
    setAdding(false);
  }

  if (activities === undefined) return null;
  const ordered = [...activities].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Activités</h1>

      <div className="flex flex-col">
        {ordered.map((activity, index) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
            isFirst={index === 0}
            isLast={index === ordered.length - 1}
            onMove={(direction) => {
              void moveActivity(activity, direction, ordered);
            }}
          />
        ))}
      </div>

      {adding ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Field label="Nom" htmlFor="new-activity-name">
            <input
              id="new-activity-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Catégorie" htmlFor="new-activity-category">
            <select
              id="new-activity-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ActivityCategory);
              }}
              className={inputClass}
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {activityCategoryLabels[c]}
                </option>
              ))}
            </select>
          </Field>
          <ColorPicker value={color} onChange={setColor} />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAdding(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                void addActivity();
              }}
            >
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setAdding(true);
          }}
        >
          + Ajouter une activité
        </Button>
      )}
    </div>
  );
}
