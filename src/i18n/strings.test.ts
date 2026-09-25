import { describe, expect, it } from 'vitest';
import { LANGS, LETTER_TYPE_IDS } from '../types/letter';
import { LETTER_TYPES } from '../letters/registry';
import { strings } from './strings';

const emptyPaths = (value: unknown, path = ''): string[] =>
  typeof value === 'string'
    ? (value.trim() ? [] : [path])
    : Object.entries(value as object).flatMap(([key, v]) => emptyPaths(v, path ? `${path}.${key}` : key));

// Matching keys are enforced by the compiler; this catches keys filled with ''.
describe('strings', () => {
  it.each(LANGS)('has no empty UI strings in %s', (lang) => {
    expect(emptyPaths(strings[lang])).toEqual([]);
  });

  it.each(LETTER_TYPE_IDS.flatMap((id) => LANGS.map((lang) => [id, lang] as const)))('%s has a %s name, and a title if titled', (id, lang) => {
    const def = LETTER_TYPES[id];
    expect(def.strings[lang].name.trim()).not.toBe('');
    if (def.heading === 'titled') expect(def.strings[lang].title?.trim()).toBeTruthy();
  });
});
