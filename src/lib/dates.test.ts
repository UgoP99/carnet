import { describe, expect, it } from 'vitest';
import {
  addMonths,
  addWeeks,
  isoWeekKey,
  monthKey,
  monthRange,
  recentWeeks,
  todayLocal,
  weekRange,
} from './dates';

describe('todayLocal', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    expect(todayLocal(new Date(2026, 8, 30, 23, 59))).toBe('2026-09-30');
  });
});

describe('isoWeekKey', () => {
  it('returns the ISO week for a mid-week date', () => {
    expect(isoWeekKey('2026-09-30')).toBe('2026-W40');
  });

  it('assigns early-January dates to the previous ISO year when applicable', () => {
    expect(isoWeekKey('2027-01-03')).toBe('2026-W53');
  });

  it('assigns late-December dates to the next ISO year when applicable', () => {
    expect(isoWeekKey('2027-01-04')).toBe('2027-W01');
  });
});

describe('weekRange', () => {
  it('returns Monday–Sunday bounds for a regular week', () => {
    expect(weekRange('2026-W40')).toEqual({ start: '2026-09-28', end: '2026-10-04' });
  });

  it('handles the year-boundary week 2026-W53', () => {
    expect(weekRange('2026-W53')).toEqual({ start: '2026-12-28', end: '2027-01-03' });
  });

  it('handles 2027-W01', () => {
    expect(weekRange('2027-W01')).toEqual({ start: '2027-01-04', end: '2027-01-10' });
  });
});

describe('addWeeks', () => {
  it('advances across the 2026/2027 ISO year boundary', () => {
    expect(addWeeks('2026-W53', 1)).toBe('2027-W01');
  });

  it('goes back across the boundary', () => {
    expect(addWeeks('2027-W01', -1)).toBe('2026-W53');
  });

  it('stays on the same calendar weekday across the March DST transition (France)', () => {
    // 2026-03-29 is the DST transition Sunday in France.
    const before = weekRange('2026-W12');
    expect(before.start).toBe('2026-03-16');
    const after = addWeeks('2026-W12', 2);
    expect(weekRange(after)).toEqual({ start: '2026-03-30', end: '2026-04-05' });
  });

  it('stays on the same calendar weekday across the October DST transition (France)', () => {
    // 2026-10-25 is the DST transition Sunday in France, the last day of ISO week 43.
    const after = addWeeks('2026-W42', 1);
    expect(weekRange(after)).toEqual({ start: '2026-10-19', end: '2026-10-25' });
  });
});

describe('recentWeeks', () => {
  it('returns the N weeks ending at the given week, oldest first', () => {
    expect(recentWeeks('2026-W40', 3)).toEqual(['2026-W38', '2026-W39', '2026-W40']);
  });

  it('spans the ISO year boundary', () => {
    expect(recentWeeks('2027-W01', 2)).toEqual(['2026-W53', '2027-W01']);
  });

  it('returns just the given week when count is 1', () => {
    expect(recentWeeks('2026-W40', 1)).toEqual(['2026-W40']);
  });
});

describe('monthKey', () => {
  it('formats a Date as YYYY-MM', () => {
    expect(monthKey(new Date(2026, 8, 30, 23, 59))).toBe('2026-09');
  });

  it('formats a local date string', () => {
    expect(monthKey('2026-01-15')).toBe('2026-01');
  });
});

describe('monthRange', () => {
  it('returns first-last day bounds for a regular month', () => {
    expect(monthRange('2026-09')).toEqual({ start: '2026-09-01', end: '2026-09-30' });
  });

  it('handles February on a leap year', () => {
    expect(monthRange('2028-02')).toEqual({ start: '2028-02-01', end: '2028-02-29' });
  });
});

describe('addMonths', () => {
  it('advances across a calendar year boundary', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
  });

  it('goes back across the boundary', () => {
    expect(addMonths('2027-01', -1)).toBe('2026-12');
  });
});
