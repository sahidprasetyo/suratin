import type { Lang } from '../types/letter';

const LOCALES: Record<Lang, string> = { id: 'id-ID', en: 'en-GB' };

/**
 * Parses yyyy-mm-dd as a local calendar date. `new Date('2026-09-25')` would be
 * read as UTC midnight and show the previous day west of UTC.
 */
export function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
}

const formatter = (lang: Lang, weekday: boolean) =>
  new Intl.DateTimeFormat(LOCALES[lang], {
    weekday: weekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Returns '' for empty or invalid input so the letter never shows "Invalid Date". */
export function formatDate(iso: string, lang: Lang, { weekday = false } = {}): string {
  const date = parseIsoDate(iso);
  return date ? formatter(lang, weekday).format(date) : '';
}

export function formatDateRange(startIso: string, endIso: string, lang: Lang): string {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso);
  if (!start || !end) return formatDate(start ? startIso : endIso, lang);
  if (end < start) return `${formatDate(startIso, lang)} – ${formatDate(endIso, lang)}`;
  return formatter(lang, false).formatRange(start, end);
}
