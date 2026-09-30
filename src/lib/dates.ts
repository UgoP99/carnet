import {
  addWeeks as addWeeksToDate,
  endOfISOWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  parseISO,
  startOfISOWeek,
} from 'date-fns';

export type LocalDate = string; // YYYY-MM-DD
export type WeekKey = string; // YYYY-Www

export function todayLocal(now: Date = new Date()): LocalDate {
  return format(now, 'yyyy-MM-dd');
}

export function isoWeekKey(date: LocalDate | Date): WeekKey {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const week = String(getISOWeek(d)).padStart(2, '0');
  return `${getISOWeekYear(d)}-W${week}`;
}

/** Monday–Sunday bounds (inclusive) of an ISO week, as local dates. */
export function weekRange(weekKey: WeekKey): { start: LocalDate; end: LocalDate } {
  const [yearPart, weekPart] = weekKey.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  // January 4th always falls in ISO week 1.
  const week1Monday = startOfISOWeek(new Date(year, 0, 4));
  const monday = addWeeksToDate(week1Monday, week - 1);
  return { start: format(monday, 'yyyy-MM-dd'), end: format(endOfISOWeek(monday), 'yyyy-MM-dd') };
}

export function addWeeks(weekKey: WeekKey, count: number): WeekKey {
  const { start } = weekRange(weekKey);
  return isoWeekKey(addWeeksToDate(parseISO(start), count));
}
