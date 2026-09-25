import { describe, expect, it } from 'vitest';
import { createSample } from '../letters/samples';
import { isUntouched, switchLetter } from './switching';

describe('switchLetter', () => {
  it('swaps an untouched sample for the target sample', () => {
    const current = createSample('invitation', 'id');
    const result = switchLetter(current, { type: 'invitation', lang: 'id' }, { type: 'assignment', lang: 'en' });
    expect(result.letter).toEqual(createSample('assignment', 'en'));
    expect(result.showUntranslatedNotice).toBe(false);
  });

  it('keeps edited text on a language switch and flags it', () => {
    const current = createSample('notice', 'id');
    current.body = 'Teks saya sendiri';
    const result = switchLetter(current, { type: 'notice', lang: 'id' }, { type: 'notice', lang: 'en' });
    expect(result.letter).toBe(current);
    expect(result.showUntranslatedNotice).toBe(true);
  });

  it('keeps edited text on a type switch without the notice', () => {
    const current = createSample('invitation', 'en');
    current.letterhead.name = 'My Club';
    const result = switchLetter(current, { type: 'invitation', lang: 'en' }, { type: 'request', lang: 'en' });
    expect(result.letter).toBe(current);
    expect(result.showUntranslatedNotice).toBe(false);
  });

  it('treats an edit inside another type\'s block as edited', () => {
    const current = createSample('notice', 'en');
    current.blocks.request.items.push({ text: 'Extra' });
    expect(isUntouched(current, { type: 'notice', lang: 'en' })).toBe(false);
  });

  it('returns independent copies, so editing one sample never changes the next', () => {
    const first = createSample('invitation', 'en');
    first.blocks.invitation.agenda[0].text = 'Changed';
    expect(createSample('invitation', 'en').blocks.invitation.agenda[0].text).not.toBe('Changed');
  });
});
