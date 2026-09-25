import { LETTER_TYPE_IDS } from '../types/letter';
import type { Lang, Letter, LetterBlocks, LetterTypeId } from '../types/letter';
import { LETTER_TYPES } from './registry';
import type { SampleContent } from './types';

type SharedSample = Omit<Letter, keyof SampleContent | 'blocks'>;

// Fictional organisation and people; placeholder contact details only.
const shared: Record<Lang, SharedSample> = {
  id: {
    letterhead: {
      logoDataUrl: null,
      name: 'YAYASAN CENDEKIA NUSANTARA',
      subName: 'Sekretariat Pusat',
      address: 'Jl. Contoh Raya No. 1, Jakarta 10110 · sekretariat@example.com',
    },
    attachment: '',
    place: 'Jakarta',
    date: '2026-09-25',
    openingLine: '',
    signatories: [
      { roleHeader: 'Ketua,', name: 'Budi Santoso', roleTitle: '' },
      { roleHeader: 'Sekretaris,', name: 'Siti Rahmawati', roleTitle: '' },
    ],
  },
  en: {
    letterhead: {
      logoDataUrl: null,
      name: 'NUSANTARA LEARNING FOUNDATION',
      subName: 'Head Office',
      address: '1 Example Street, Jakarta 10110, Indonesia · office@example.com',
    },
    attachment: '',
    place: 'Jakarta',
    date: '2026-09-25',
    openingLine: '',
    signatories: [
      { roleHeader: '', name: 'Jane Doe', roleTitle: 'Chair' },
    ],
  },
};

/** A fresh, deep-copied sample letter; every type's block is filled in the same language. */
export function createSample(type: LetterTypeId, lang: Lang): Letter {
  const blocks = Object.fromEntries(
    LETTER_TYPE_IDS.map((id) => [id, LETTER_TYPES[id].sample[lang].block]),
  ) as unknown as LetterBlocks;
  return structuredClone({ ...shared[lang], ...LETTER_TYPES[type].sample[lang].content, blocks });
}
