import {
  addMonths as addMonthsToDate,
  addWeeks as addWeeksToDate,
  endOfISOWeek,
  endOfMonth,
  format,
  getISOWeek,
  getISOWeekYear,
  parseISO,
  startOfISOWeek,
  startOfMonth,
} from 'date-fns';

export type LocalDate = string; // YYYY-MM-DD
export type WeekKey = string; // YYYY-Www
export type MonthKey = string; // YYYY-MM

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

/** The `count` ISO weeks ending at (and including) `weekKey`, oldest first. */
export function recentWeeks(weekKey: WeekKey, count: number): WeekKey[] {
  return Array.from({ length: count }, (_, i) => addWeeks(weekKey, i - (count - 1)));
}

export function monthKey(date: LocalDate | Date): MonthKey {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM');
}

/** First–last day bounds (inclusive) of a calendar month, as local dates. */
export function monthRange(month: MonthKey): { start: LocalDate; end: LocalDate } {
  const first = parseISO(`${month}-01`);
  return {
    start: format(startOfMonth(first), 'yyyy-MM-dd'),
    end: format(endOfMonth(first), 'yyyy-MM-dd'),
  };
}

export function addMonths(month: MonthKey, count: number): MonthKey {
  return monthKey(addMonthsToDate(parseISO(`${month}-01`), count));
}
