import type { Letter, LetterTypeId } from '../../types/letter';
import { LETTER_TYPES } from '../../letters/registry';
import { strings } from '../../i18n/strings';
import { formatDate } from '../../lib/formatDate';
import LetterBody from './LetterBody';
import { Letterhead, Signatures } from './parts';

const t = strings.en.letter;

// Block-style business letter: ref, date, recipient, subject, then the body; signatures follow the close.
export default function EnglishLayout({ letter, type }: { letter: Letter; type: LetterTypeId }) {
  const def = LETTER_TYPES[type];
  const titled = def.heading === 'titled';
  const date = formatDate(letter.date, 'en');
  const { name, address } = letter.recipient;

  return (
    <>
      <Letterhead letterhead={letter.letterhead} />
      {titled && <p className="text-center font-bold underline uppercase text-[14pt] mb-6">{def.strings.en.title}</p>}
      <div className="mb-6 space-y-4">
        <div>
          {letter.referenceNumber && <p>{t.ref}: {letter.referenceNumber}</p>}
          {date && <p>{date}</p>}
        </div>
        {!titled && (name || address) && (
          <div>
            <p>{name}</p>
            <p className="whitespace-pre-line">{address}</p>
          </div>
        )}
        {!titled && letter.subject && <p className="font-bold">{t.subject}: {letter.subject}</p>}
      </div>
      <LetterBody letter={letter} type={type} lang="en" indent={false} />
      <Signatures signatories={letter.signatories} align="start" close={letter.complimentaryClose} />
      {!titled && letter.attachment && <p className="mt-6">{t.enclosure}: {letter.attachment}</p>}
    </>
  );
}
