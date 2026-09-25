import type { ComponentType } from 'react';
import type { Lang, Letter, LetterBlocks, LetterTypeId } from '../types/letter';

/** The per-type parts of a sample; shared parts (letterhead, signatories…) live in samples.ts. */
export type SampleContent = Pick<
  Letter,
  'referenceNumber' | 'subject' | 'recipient' | 'salutation' | 'body' | 'closingText' | 'complimentaryClose'
>;

export interface LetterTypeDef<K extends LetterTypeId> {
  id: K;
  /** correspondence: Nomor/Perihal + recipient block. titled: centred title, no recipient. */
  heading: 'correspondence' | 'titled';
  strings: Record<Lang, { name: string; title?: string }>;
  sample: Record<Lang, { content: SampleContent; block: LetterBlocks[K] }>;
  /** Editor section for blocks[K]; omitted when the type has no block of its own. */
  Editor?: ComponentType;
  Block?: ComponentType<{ block: LetterBlocks[K]; lang: Lang }>;
}
