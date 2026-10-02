import { useState } from 'react';
import { parseHttpsUrl } from '@/lib/url';
import { Button } from '@/ui/Button';

export interface VideoLinkValue {
  url: string;
  label: string;
}

interface VideoLinksFieldProps {
  links: VideoLinkValue[];
  onChange: (links: VideoLinkValue[]) => void;
}

const inputClass =
  'min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export function VideoLinksField({ links, onChange }: VideoLinksFieldProps) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string>();

  function add() {
    if (!parseHttpsUrl(url)) {
      setError('URL https invalide');
      return;
    }
    if (links.length >= 10) {
      setError('10 liens maximum');
      return;
    }
    onChange([...links, { url: url.trim(), label: label.trim() }]);
    setUrl('');
    setLabel('');
    setError(undefined);
  }

  function remove(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vidéos</span>
      {links.length > 0 && (
        <ul className="flex flex-col gap-2">
          {links.map((link, index) => (
            <li
              key={`${link.url}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-slate-900 dark:text-white">
                {link.label || link.url}
              </span>
              <button
                type="button"
                aria-label={`Retirer le lien ${link.label || link.url}`}
                onClick={() => {
                  remove(index);
                }}
                className="flex min-h-11 min-w-11 items-center justify-center text-slate-500 dark:text-slate-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <label htmlFor="video-link-url" className="sr-only">
        URL de la vidéo (https)
      </label>
      <input
        id="video-link-url"
        type="url"
        placeholder="https://…"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
        }}
        className={inputClass}
      />
      <div className="flex gap-2">
        <label htmlFor="video-link-label" className="sr-only">
          Libellé (optionnel)
        </label>
        <input
          id="video-link-label"
          type="text"
          placeholder="Libellé (optionnel)"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
          }}
          className={inputClass}
        />
        <Button variant="secondary" onClick={add}>
          Ajouter
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
