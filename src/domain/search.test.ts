import { describe, expect, it } from 'vitest';
import { makeGamePlan, makeSession, makeTechnique, makeTechniqueLog } from '@/test/factories';
import { EMPTY_SEARCH_RESULTS, search, type SearchData } from './search';

function data(overrides: Partial<SearchData> = {}): SearchData {
  return { sessions: [], techniques: [], techniqueLogs: [], gamePlans: [], ...overrides };
}

describe('search', () => {
  it('returns empty results for a blank query', () => {
    expect(search('', data({ techniques: [makeTechnique()] }))).toEqual(EMPTY_SEARCH_RESULTS);
    expect(search('   ', data({ techniques: [makeTechnique()] }))).toEqual(EMPTY_SEARCH_RESULTS);
  });

  it('matches session notes and partners, accent- and case-insensitive', () => {
    const withNote = makeSession({ notes: 'Travail du étranglement arrière' });
    const withPartner = makeSession({ grappling: { content: [], partners: ['Émilie'] } });
    const other = makeSession({ notes: 'Rien à voir' });

    const results = search('ETRANGLEMENT', data({ sessions: [withNote, withPartner, other] }));
    expect(results.sessions).toEqual([withNote]);

    const byPartner = search('emilie', data({ sessions: [withNote, withPartner, other] }));
    expect(byPartner.sessions).toEqual([withPartner]);
  });

  it('matches technique name, summary and tags', () => {
    const byName = makeTechnique({ name: 'Kimura' });
    const bySummary = makeTechnique({ summary: 'Contrôle le poignet puis coude' });
    const byTag = makeTechnique({ tags: ['leglock'] });
    const other = makeTechnique({ name: 'Armbar', summary: undefined, tags: [] });

    const results = search('kimura', data({ techniques: [byName, bySummary, byTag, other] }));
    expect(results.techniques).toEqual([byName]);

    expect(
      search('coude', data({ techniques: [byName, bySummary, byTag, other] })).techniques,
    ).toEqual([bySummary]);
    expect(
      search('leglock', data({ techniques: [byName, bySummary, byTag, other] })).techniques,
    ).toEqual([byTag]);
  });

  it('matches technique log text', () => {
    const log = makeTechniqueLog({ text: 'Bien fonctionné contre un gaucher' });
    const other = makeTechniqueLog({ text: 'Rien à signaler' });

    const results = search('gaucher', data({ techniqueLogs: [log, other] }));
    expect(results.techniqueLogs).toEqual([log]);
  });

  it('matches game plan name and description', () => {
    const plan = makeGamePlan({ name: 'Jeu de garde', description: 'Passage de garde' });
    const other = makeGamePlan({ name: 'Debout' });

    expect(search('garde', data({ gamePlans: [plan, other] })).gamePlans).toEqual([plan]);
  });

  it('searches 2000 sessions in under 200ms', () => {
    const sessions = Array.from({ length: 2000 }, (_, i) =>
      makeSession({ notes: i === 1000 ? 'Mot rare étranglement' : `Session numéro ${i}` }),
    );

    const start = performance.now();
    const results = search('etranglement', data({ sessions }));
    const elapsed = performance.now() - start;

    expect(results.sessions).toHaveLength(1);
    expect(elapsed).toBeLessThan(200);
  });
});
