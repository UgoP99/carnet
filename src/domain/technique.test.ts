import { describe, expect, it } from 'vitest';
import { makeTechnique, makeTechniqueLog } from '@/test/factories';
import { EMPTY_TECHNIQUE_FILTERS, filterTechniques, techniqueStats } from './technique';

describe('techniqueStats', () => {
  it('returns zero/null for a technique with no logs', () => {
    expect(techniqueStats([])).toEqual({ timesSeen: 0, lastSeen: null });
  });

  it('counts logs and finds the most recent date', () => {
    const logs = [
      makeTechniqueLog({ date: '2026-09-10' }),
      makeTechniqueLog({ date: '2026-09-28' }),
      makeTechniqueLog({ date: '2026-09-15' }),
    ];
    expect(techniqueStats(logs)).toEqual({ timesSeen: 3, lastSeen: '2026-09-28' });
  });
});

describe('filterTechniques', () => {
  const armbar = makeTechnique({
    name: 'Armbar from closed guard',
    position: 'closed_guard',
    perspective: 'bottom',
    type: 'submission',
    attire: 'both',
    tags: ['armlock'],
  });
  const passing = makeTechnique({
    name: 'Toreando pass',
    position: 'open_guard',
    perspective: 'top',
    type: 'guard_pass',
    attire: 'gi',
    tags: ['pressure'],
  });
  const archived = makeTechnique({
    name: 'Old sweep',
    position: 'closed_guard',
    perspective: 'bottom',
    type: 'sweep',
    attire: 'nogi',
    tags: [],
    archived: true,
  });
  const all = [armbar, passing, archived];

  it('excludes archived techniques by default', () => {
    expect(filterTechniques(all, EMPTY_TECHNIQUE_FILTERS)).toEqual([armbar, passing]);
  });

  it('includes archived techniques when asked', () => {
    expect(filterTechniques(all, { ...EMPTY_TECHNIQUE_FILTERS, includeArchived: true })).toEqual(
      all,
    );
  });

  it('matches name search, accent/case-insensitive', () => {
    expect(filterTechniques(all, { ...EMPTY_TECHNIQUE_FILTERS, search: 'ARMBAR' })).toEqual([
      armbar,
    ]);
  });

  it('combines type, perspective, attire and tag filters with AND', () => {
    const result = filterTechniques(all, {
      ...EMPTY_TECHNIQUE_FILTERS,
      types: ['submission', 'guard_pass'],
      perspectives: ['bottom'],
    });
    expect(result).toEqual([armbar]);
  });

  it('matches tags on any selected value (OR within the tags filter)', () => {
    const result = filterTechniques(all, {
      ...EMPTY_TECHNIQUE_FILTERS,
      tags: ['armlock', 'pressure'],
    });
    expect(result).toEqual([armbar, passing]);
  });
});
