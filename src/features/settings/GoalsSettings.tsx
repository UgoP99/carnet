import { useState } from 'react';
import { useActivities, useSettings } from '@/db/hooks';
import { saveSettings } from '@/db/metaRepo';
import type { Activity, Settings } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Stepper } from '@/ui/Stepper';

const inputClass =
  'min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

function GoalsForm({ settings, activities }: { settings: Settings; activities: Activity[] }) {
  const [weeklyMinutes, setWeeklyMinutes] = useState(
    () => settings.goals.weeklyMinutes?.toString() ?? '',
  );
  const [perActivity, setPerActivity] = useState<Record<string, number>>(() =>
    Object.fromEntries(settings.goals.perActivity.map((g) => [g.activityId, g.sessionsPerWeek])),
  );
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const minutes = weeklyMinutes.trim() === '' ? undefined : Number(weeklyMinutes);
    const next: Settings = {
      ...settings,
      goals: {
        weeklyMinutes: minutes,
        perActivity: Object.entries(perActivity)
          .filter(([, sessionsPerWeek]) => sessionsPerWeek > 0)
          .map(([activityId, sessionsPerWeek]) => ({ activityId, sessionsPerWeek })),
      },
    };
    await saveSettings(next);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Objectifs</h1>

      <Field label="Minutes par semaine (optionnel)" htmlFor="goal-weekly-minutes">
        <input
          id="goal-weekly-minutes"
          type="number"
          inputMode="numeric"
          min={0}
          value={weeklyMinutes}
          onChange={(e) => {
            setWeeklyMinutes(e.target.value);
            setSaved(false);
          }}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Séances par semaine, par activité
        </h2>
        {activities
          .filter((a) => !a.archived)
          .map((activity) => (
            <div key={activity.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">{activity.name}</span>
              <Stepper
                label={activity.name}
                min={0}
                max={14}
                value={perActivity[activity.id] ?? 0}
                onChange={(value) => {
                  setPerActivity((prev) => ({ ...prev, [activity.id]: value }));
                  setSaved(false);
                }}
              />
            </div>
          ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            void handleSave();
          }}
        >
          Enregistrer
        </Button>
        {saved && <span className="text-sm text-slate-500 dark:text-slate-400">Enregistré.</span>}
      </div>
    </div>
  );
}

export function GoalsSettings() {
  const settings = useSettings();
  const activities = useActivities();

  if (settings === undefined || activities === undefined) return null;

  return <GoalsForm settings={settings} activities={activities} />;
}
