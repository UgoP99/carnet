import type { GamePlan, Session, Technique, TechniqueLog } from './schemas';
import { normalize } from '@/lib/text';

export interface SearchData {
  sessions: Session[];
  techniques: Technique[];
  techniqueLogs: TechniqueLog[];
  gamePlans: GamePlan[];
}

export interface SearchResults {
  sessions: Session[];
  techniques: Technique[];
  techniqueLogs: TechniqueLog[];
  gamePlans: GamePlan[];
}

export const EMPTY_SEARCH_RESULTS: SearchResults = {
  sessions: [],
  techniques: [],
  techniqueLogs: [],
  gamePlans: [],
};

function matches(needle: string, ...haystacks: (string | undefined)[]): boolean {
  return haystacks.some((h) => h && normalize(h).includes(needle));
}

/** Accent/case-insensitive search across sessions, techniques, technique logs and game plans. */
export function search(query: string, data: SearchData): SearchResults {
  const needle = normalize(query);
  if (!needle) return EMPTY_SEARCH_RESULTS;

  return {
    sessions: data.sessions.filter((s) =>
      matches(needle, s.notes, ...(s.grappling?.partners ?? [])),
    ),
    techniques: data.techniques.filter((t) => matches(needle, t.name, t.summary, ...t.tags)),
    techniqueLogs: data.techniqueLogs.filter((l) => matches(needle, l.text)),
    gamePlans: data.gamePlans.filter((p) => matches(needle, p.name, p.description)),
  };
}
