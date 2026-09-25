import { LANGS, LETTER_TYPE_IDS, MAX_SIGNATORIES } from '../types/letter';
import type { Lang, Letter, LetterTypeId, SavedState } from '../types/letter';
import { createSample } from '../letters/samples';

export const STORAGE_KEY = 'letter-builder:v2';
/** Each backup gets its own timestamped key so a later one never replaces an earlier one. */
export const BACKUP_PREFIX = `${STORAGE_KEY}:backup:`;

const LOGO_DATA_URL = /^data:image\/(png|jpeg|svg\+xml);base64,/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  list.includes(value as T);

/** Only the envelope must be exact; the letter inside is repaired by repairLetter(). */
export function isSavedEnvelope(value: unknown): value is { version: 2; lang: Lang; type: LetterTypeId; letter: unknown } {
  return isObject(value) && value.version === 2 && includes(LANGS, value.lang) && includes(LETTER_TYPE_IDS, value.type);
}

/**
 * Rebuilds `saved` in the shape of `template` so partial or hand-edited data can't crash
 * rendering: missing or wrong-typed strings become '', non-object list items are dropped.
 * Keys follow the template's order, which keeps the untouched-sample comparison stable.
 */
function conform<T>(saved: unknown, template: T): T {
  if (typeof template === 'string') return (typeof saved === 'string' ? saved : '') as T;
  if (template === null) return (typeof saved === 'string' ? saved : null) as T;
  if (Array.isArray(template)) {
    // Every sample list has at least one item to serve as the shape of the rest.
    if (!Array.isArray(saved) || !template.length) return [] as T;
    return saved.filter(isObject).map((item) => conform(item, template[0])) as T;
  }
  const source = isObject(saved) ? saved : {};
  return Object.fromEntries(
    Object.entries(template as object).map(([key, value]) => [key, conform(source[key], value)]),
  ) as T;
}

export function repairLetter(saved: unknown, type: LetterTypeId, lang: Lang): Letter {
  const letter = conform(saved, createSample(type, lang));
  if (!LOGO_DATA_URL.test(letter.letterhead.logoDataUrl ?? '')) letter.letterhead.logoDataUrl = null;
  letter.signatories = letter.signatories.slice(0, MAX_SIGNATORIES);
  if (!letter.signatories.length) letter.signatories = [{ roleHeader: '', name: '', roleTitle: '' }];
  if (!letter.blocks.assignment.assignees.length) {
    letter.blocks.assignment.assignees = [{ name: '', idNumber: '', position: '' }];
  }
  return letter;
}

export const defaultLang = (): Lang =>
  typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('id') ? 'id' : 'en';

export const freshState = (lang: Lang = defaultLang()): SavedState =>
  ({ version: 2, lang, type: 'invitation', letter: createSample('invitation', lang) });

const errorName = (err: unknown) => (err instanceof Error ? err.name : 'unknown error');

// Logs error names only: parse errors quote the input, which is the user's letter.
function keepBackup(raw: string): boolean {
  const key = `${BACKUP_PREFIX}${Date.now()}`;
  try {
    localStorage.setItem(key, raw);
    console.warn(`The original saved letter was kept under "${key}".`);
    return true;
  } catch (err) {
    console.warn(`Could not back up the original saved letter (${errorName(err)}).`);
    return false;
  }
}

export interface LoadResult {
  state: SavedState;
  /**
   * True when the stored data had to be replaced or repaired but couldn't be backed up.
   * Autosave must stay off until the user agrees, or it would destroy the only copy.
   */
  backupFailed: boolean;
}

export function loadState(): LoadResult {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: freshState(), backupFailed: false };
    const parsed: unknown = JSON.parse(raw);
    if (isSavedEnvelope(parsed)) {
      const letter = repairLetter(parsed.letter, parsed.type, parsed.lang);
      // The first autosave overwrites the original, so keep it if repair changed anything.
      const changed = JSON.stringify(letter) !== JSON.stringify(parsed.letter);
      const backupFailed = changed && !keepBackup(raw);
      return { state: { version: 2, lang: parsed.lang, type: parsed.type, letter }, backupFailed };
    }
    console.warn('Saved letter is from an unknown version; starting from a sample.');
  } catch (err) {
    console.warn(`Could not read the saved letter (${errorName(err)}); starting from a sample.`);
  }
  return { state: freshState(), backupFailed: raw !== null && !keepBackup(raw) };
}

/** Returns false when storage is full or blocked, so the UI can warn the user. */
export function saveState(state: SavedState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
