import { useState } from 'react';
import { normalize } from '@/lib/text';
import { Button } from '@/ui/Button';

interface TagsFieldProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const inputClass =
  'min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function TagsField({ tags, onChange }: TagsFieldProps) {
  const [text, setText] = useState('');

  function add(value: string) {
    const trimmed = normalize(value);
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tags</span>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-label={`Retirer le tag ${tag}`}
              onClick={() => {
                remove(tag);
              }}
              className="flex min-h-11 items-center gap-1 rounded-full bg-slate-100 px-3 text-sm dark:bg-slate-800"
            >
              {tag} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          aria-label="Ajouter un tag"
          placeholder="ex. de-la-riva"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(text);
              setText('');
            }
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
