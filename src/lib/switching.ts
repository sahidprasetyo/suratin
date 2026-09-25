import type { Lang, Letter, LetterTypeId } from '../types/letter';
import { createSample } from '../letters/samples';

export interface LetterKind { type: LetterTypeId; lang: Lang }

/**
 * Compares against the sample rather than using react-hook-form's isDirty, which resets
 * to false after a reload even when the letter was edited. A false "edited" is the safe
 * direction: it keeps the user's text.
 */
export const isUntouched = (letter: Letter, { type, lang }: LetterKind): boolean =>
  JSON.stringify(letter) === JSON.stringify(createSample(type, lang));

/** Never overwrites typed text: an untouched sample is swapped, an edited letter is kept. */
export function switchLetter(current: Letter, from: LetterKind, to: LetterKind): { letter: Letter; showUntranslatedNotice: boolean } {
  if (isUntouched(current, from)) {
    return { letter: createSample(to.type, to.lang), showUntranslatedNotice: false };
  }
  return { letter: current, showUntranslatedNotice: from.lang !== to.lang };
}
