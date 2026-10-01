import { useState } from 'react';
import { Button } from '@/ui/Button';
import { Chips } from '@/ui/Chips';

interface PartnersFieldProps {
  partners: string[];
  knownPartners: string[];
  onChange: (partners: string[]) => void;
}

const inputClass =
  'min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function PartnersField({ partners, knownPartners, onChange }: PartnersFieldProps) {
  const [text, setText] = useState('');
  const suggestions = knownPartners.filter((p) => !partners.includes(p));

  function add(name: string) {
    const trimmed = name.trim();
    if (!trimmed || partners.includes(trimmed)) return;
    onChange([...partners, trimmed]);
  }

  function remove(name: string) {
    onChange(partners.filter((p) => p !== name));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Partenaires</span>
      {partners.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {partners.map((p) => (
            <button
              key={p}
              type="button"
              aria-label={`Retirer ${p}`}
              onClick={() => {
                remove(p);
              }}
              className="flex min-h-11 items-center gap-1 rounded-full bg-slate-100 px-3 text-sm dark:bg-slate-800"
            >
              {p} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <Chips
          aria-label="Partenaires connus"
          options={suggestions.map((p) => ({ value: p, label: p }))}
          value={[]}
          onChange={(v) => {
            if (v[0]) add(v[0]);
          }}
        />
      )}
      <div className="flex gap-2">
        <input
          type="text"
          aria-label="Nom du partenaire"
          placeholder="Ajouter un partenaire"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          className={inputClass}
        />
        <Button
          variant="secondary"
          onClick={() => {
            add(text);
            setText('');
          }}
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}
