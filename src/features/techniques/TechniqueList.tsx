import { Plus, Swords } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTechniqueLogs, useTechniques } from '@/db/hooks';
import {
  PERSPECTIVES,
  perspectiveLabels,
  POSITIONS,
  positionLabels,
  TECHNIQUE_ATTIRES,
  techniqueAttireLabels,
  TECHNIQUE_TYPES,
  techniqueTypeLabels,
  type Perspective,
  type TechniqueAttire,
  type TechniqueType,
} from '@/domain/labels.grappling';
import type { Technique, TechniqueLog } from '@/domain/schemas';
import { EMPTY_TECHNIQUE_FILTERS, filterTechniques, techniqueStats } from '@/domain/technique';
import { Chips } from '@/ui/Chips';
import { EmptyState } from '@/ui/EmptyState';

function groupByPosition(techniques: Technique[]): { position: string; techniques: Technique[] }[] {
  return POSITIONS.map((position) => ({
    position,
    techniques: techniques.filter((t) => t.position === position),
  })).filter((g) => g.techniques.length > 0);
}

function TechniqueRow({ technique, logs }: { technique: Technique; logs: TechniqueLog[] }) {
  const { timesSeen, lastSeen } = techniqueStats(logs);
  return (
    <Link
      to={`/techniques/${technique.id}`}
      className="flex min-h-11 flex-col gap-0.5 rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
    >
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
          {technique.name}
        </span>
        {technique.archived && (
          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Archivée
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {techniqueTypeLabels[technique.type]} · {perspectiveLabels[technique.perspective]}
        {timesSeen > 0 && ` · vue ${timesSeen}×`}
        {lastSeen && ` · dernière le ${lastSeen}`}
      </p>
    </Link>
  );
}

export function TechniqueList() {
  const techniques = useTechniques();
  const logs = useTechniqueLogs();
  const [filters, setFilters] = useState(EMPTY_TECHNIQUE_FILTERS);

  const allTags = useMemo(
    () =>
      Array.from(new Set((techniques ?? []).flatMap((t) => t.tags))).sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [techniques],
  );

  const logsByTechnique = useMemo(() => {
    const map = new Map<string, TechniqueLog[]>();
    for (const log of logs ?? []) {
      const list = map.get(log.techniqueId);
      if (list) list.push(log);
      else map.set(log.techniqueId, [log]);
    }
    return map;
  }, [logs]);

  const filtered = useMemo(
    () => filterTechniques(techniques ?? [], filters),
    [techniques, filters],
  );
  const groups = useMemo(() => groupByPosition(filtered), [filtered]);

  if (techniques === undefined || logs === undefined) return null;

  return (
    <div className="flex flex-col gap-4 pb-20">
      <h1 className="text-xl font-semibold">Techniques</h1>

      <input
        type="text"
        aria-label="Rechercher une technique"
        placeholder="Rechercher…"
        value={filters.search}
        onChange={(e) => {
          setFilters((f) => ({ ...f, search: e.target.value }));
        }}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />

      <Chips
        aria-label="Filtrer par type"
        multi
        options={TECHNIQUE_TYPES.map((t) => ({ value: t, label: techniqueTypeLabels[t] }))}
        value={filters.types}
        onChange={(types) => {
          setFilters((f) => ({ ...f, types: types as TechniqueType[] }));
        }}
      />

      <Chips
        aria-label="Filtrer par perspective"
        multi
        options={PERSPECTIVES.map((p) => ({ value: p, label: perspectiveLabels[p] }))}
        value={filters.perspectives}
        onChange={(perspectives) => {
          setFilters((f) => ({ ...f, perspectives: perspectives as Perspective[] }));
        }}
      />

      <Chips
        aria-label="Filtrer par tenue"
        multi
        options={TECHNIQUE_ATTIRES.map((a) => ({ value: a, label: techniqueAttireLabels[a] }))}
        value={filters.attires}
        onChange={(attires) => {
          setFilters((f) => ({ ...f, attires: attires as TechniqueAttire[] }));
        }}
      />

      {allTags.length > 0 && (
        <Chips
          aria-label="Filtrer par tag"
          multi
          options={allTags.map((tag) => ({ value: tag, label: tag }))}
          value={filters.tags}
          onChange={(tags) => {
            setFilters((f) => ({ ...f, tags }));
          }}
        />
      )}

      <Chips
        aria-label="Techniques archivées"
        multi
        options={[{ value: 'archived', label: 'Voir les archivées' }]}
        value={filters.includeArchived ? ['archived'] : []}
        onChange={(v) => {
          setFilters((f) => ({ ...f, includeArchived: v.includes('archived') }));
        }}
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="Aucune technique"
          description="Ajoute ta première technique avec le bouton +."
        />
      ) : (
        groups.map(({ position, techniques: positionTechniques }) => (
          <details key={position} open className="flex flex-col gap-1">
            <summary className="min-h-11 cursor-pointer list-none text-sm font-semibold text-slate-500 dark:text-slate-400">
              {positionLabels[position as keyof typeof positionLabels]} ({positionTechniques.length}
              )
            </summary>
            <div className="flex flex-col gap-1">
              {positionTechniques.map((technique) => (
                <TechniqueRow
                  key={technique.id}
                  technique={technique}
                  logs={logsByTechnique.get(technique.id) ?? []}
                />
              ))}
            </div>
          </details>
        ))
      )}

      <Link
        to="/techniques/new"
        aria-label="Nouvelle technique"
        className="fixed bottom-[max(calc(env(safe-area-inset-bottom)+4.5rem),5rem)] right-4 flex min-h-14 min-w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-500"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </Link>
    </div>
  );
}
