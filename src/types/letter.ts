export const LANGS = ['id', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const LETTER_TYPE_IDS = ['invitation', 'notice', 'request', 'assignment'] as const;
export type LetterTypeId = (typeof LETTER_TYPE_IDS)[number];

export const MAX_SIGNATORIES = 3;

/** Wrapped in an object because react-hook-form field arrays don't support bare strings. */
export interface ListItem { text: string }

export interface Signatory { roleHeader: string; name: string; roleTitle: string }

export interface Assignee { name: string; idNumber: string; position: string }

export interface LetterBlocks {
  invitation: { eventDate: string; time: string; location: string; agenda: ListItem[] };
  notice: Record<string, never>;
  request: { items: ListItem[] };
  assignment: { assignees: Assignee[]; purpose: string; startDate: string; endDate: string; location: string };
}

export interface Letter {
  letterhead: { logoDataUrl: string | null; name: string; subName: string; address: string };
  referenceNumber: string;
  attachment: string;
  subject: string;
  place: string;
  /** ISO yyyy-mm-dd; formatted per language at render time. */
  date: string;
  recipient: { name: string; address: string };
  /** Optional line above the salutation (e.g. a religious invocation); '' hides it. */
  openingLine: string;
  salutation: string;
  body: string;
  closingText: string;
  complimentaryClose: string;
  signatories: Signatory[];
  /** Every type's block is always stored so switching type never loses data. */
  blocks: LetterBlocks;
}

export interface SavedState { version: 2; lang: Lang; type: LetterTypeId; letter: Letter }
