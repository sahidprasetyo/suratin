/// <reference types="node" />
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { formatDate, formatDateRange, parseIsoDate } from './formatDate';

// West of UTC, parsing ISO dates as UTC shows the previous day. Node applies a runtime TZ
// change immediately, so this file doesn't depend on the machine's timezone.
const originalTz = process.env.TZ;
beforeAll(() => { process.env.TZ = 'America/Los_Angeles'; });
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

describe('formatDate', () => {
  it('keeps the calendar day west of UTC', () => {
    expect(new Date('2026-09-25').getDate()).toBe(24); // the bug being guarded against
    expect(parseIsoDate('2026-09-25')?.getDate()).toBe(25);
  });

  it('formats per language, with and without weekday', () => {
    expect(formatDate('2026-09-25', 'id')).toBe('25 September 2026');
    expect(formatDate('2026-09-25', 'id', { weekday: true })).toBe('Jumat, 25 September 2026');
    expect(formatDate('2026-09-25', 'en', { weekday: true })).toMatch(/^Friday,? 25 September 2026$/);
  });

  it.each(['', 'not a date', '2026-02-30', '2026-9-5', undefined as unknown as string])('returns "" for %j', (input) => {
    expect(formatDate(input, 'en')).toBe('');
  });
});

describe('formatDateRange', () => {
  it('collapses a shared month and year', () => {
    expect(formatDateRange('2026-10-20', '2026-10-22', 'id')).toMatch(/^20\s*–\s*22 Oktober 2026$/);
    expect(formatDateRange('2026-10-20', '2026-10-22', 'en')).toMatch(/^20\s*–\s*22 October 2026$/);
  });

  it('falls back to a single date when one end is missing', () => {
    expect(formatDateRange('2026-10-20', '', 'en')).toBe('20 October 2026');
    expect(formatDateRange('', '2026-10-22', 'en')).toBe('22 October 2026');
    expect(formatDateRange('', '', 'en')).toBe('');
  });

  it('prints a reversed range as typed instead of throwing', () => {
    expect(formatDateRange('2026-10-22', '2026-10-20', 'en')).toBe('22 October 2026 – 20 October 2026');
  });
});
