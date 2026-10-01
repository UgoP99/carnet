import type { Perspective, TechniqueAttire, TechniqueType } from './labels.grappling';
import type { Technique, TechniqueLog } from './schemas';
import { normalize } from '@/lib/text';

export interface TechniqueStats {
  timesSeen: number;
  lastSeen: string | null;
}

/** `timesSeen` = number of logs (standalone notes count too); `lastSeen` = most recent log date. */
export function techniqueStats(logs: TechniqueLog[]): TechniqueStats {
  if (logs.length === 0) return { timesSeen: 0, lastSeen: null };
  const lastSeen = logs.map((log) => log.date).reduce((max, date) => (date > max ? date : max));
  return { timesSeen: logs.length, lastSeen };
}

export interface TechniqueFilters {
  search: string;
  types: TechniqueType[];
  perspectives: Perspective[];
  attires: TechniqueAttire[];
  tags: string[];
  includeArchived: boolean;
}

export const EMPTY_TECHNIQUE_FILTERS: TechniqueFilters = {
  search: '',
  types: [],
  perspectives: [],
  attires: [],
  tags: [],
  includeArchived: false,
};

/** Combines filters with AND; multi-select filters (type/perspective/attire/tags) match on ANY selected value. */
export function filterTechniques(techniques: Technique[], filters: TechniqueFilters): Technique[] {
  const normalizedSearch = normalize(filters.search);
  return techniques.filter((t) => {
    if (!filters.includeArchived && t.archived) return false;
    if (filters.types.length > 0 && !filters.types.includes(t.type)) return false;
    if (filters.perspectives.length > 0 && !filters.perspectives.includes(t.perspective)) {
      return false;
    }
    if (filters.attires.length > 0 && !filters.attires.includes(t.attire)) return false;
    if (filters.tags.length > 0 && !filters.tags.some((tag) => t.tags.includes(tag))) return false;
    if (normalizedSearch && !normalize(t.name).includes(normalizedSearch)) return false;
    return true;
  });
}
