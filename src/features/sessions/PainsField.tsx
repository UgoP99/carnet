import { useState } from 'react';
import { BODY_ZONES, bodyZoneLabels, PAIN_LEVEL_LABELS } from '@/domain/labels';
import type { PainEntry } from '@/domain/schemas';
import { Button } from '@/ui/Button';
import { Field } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';

interface PainsFieldProps {
  pains: PainEntry[];
  onChange: (pains: PainEntry[]) => void;
}

const LEVEL_OPTIONS = ([1, 2, 3] as const).map((n) => ({
  value: String(n),
  label: PAIN_LEVEL_LABELS[n] ?? String(n),
}));

export function PainsField({ pains, onChange }: PainsFieldProps) {
  const [adding, setAdding] = useState(false);
  const [zone, setZone] = useState<PainEntry['zone']>('other');
  const [level, setLevel] = useState<PainEntry['level']>(1);

  function addPain() {
    onChange([...pains, { zone, level }]);
    setAdding(false);
    setZone('other');
    setLevel(1);
  }

  function removePain(index: number) {
    onChange(pains.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Douleurs</span>
      {pains.map((pain, index) => (
        <div
          key={`${pain.zone}-${index}`}
          className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800"
        >
          <span>
            {bodyZoneLabels[pain.zone]} — {PAIN_LEVEL_LABELS[pain.level]}
          </span>
          <button
            type="button"
            aria-label={`Retirer la douleur ${bodyZoneLabels[pain.zone]}`}
            onClick={() => {
              removePain(index);
            }}
            className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 dark:text-slate-400"
          >
            ×
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <Field label="Zone" htmlFor="pain-zone">
            <select
              id="pain-zone"
              value={zone}
              onChange={(e) => {
                setZone(e.target.value as PainEntry['zone']);
              }}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base dark:border-slate-700 dark:bg-slate-900"
            >
              {BODY_ZONES.map((z) => (
                <option key={z} value={z}>
                  {bodyZoneLabels[z]}
                </option>
              ))}
            </select>
          </Field>
          <Segmented
            aria-label="Niveau de douleur"
            options={LEVEL_OPTIONS}
            value={String(level)}
            onChange={(v) => {
              setLevel(Number(v) as PainEntry['level']);
            }}
          />
          {level === 3 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Si ça persiste, consulte un professionnel de santé.
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAdding(false);
              }}
            >
              Annuler
            </Button>
            <Button onClick={addPain}>Ajouter</Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setAdding(true);
          }}
        >
          + Ajouter une douleur
        </Button>
      )}
    </div>
  );
}
