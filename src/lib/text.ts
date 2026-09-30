/** Lowercase, accent-stripped, trimmed — for accent/case-insensitive search and matching. */
export function normalize(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
