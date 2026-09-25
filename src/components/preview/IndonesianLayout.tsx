import type { Letter, LetterTypeId } from '../../types/letter';
import { LETTER_TYPES } from '../../letters/registry';
import { strings } from '../../i18n/strings';
import { formatDate } from '../../lib/formatDate';
import LetterBody from './LetterBody';
import { InfoGrid, Letterhead, Signatures } from './parts';
import type { InfoRow } from './parts';

const t = strings.id.letter;

export default function IndonesianLayout({ letter, type }: { letter: Letter; type: LetterTypeId }) {
  const def = LETTER_TYPES[type];
  const titled = def.heading === 'titled';
  const date = formatDate(letter.date, 'id');
  const address = letter.recipient.address.trim();

  return (
    <>
      <Letterhead letterhead={letter.letterhead} />
      {titled ? (
        <div className="text-center mb-8">
          <p className="font-bold underline uppercase text-[14pt]">{def.strings.id.title}</p>
          {letter.referenceNumber && <p>{t.number}: {letter.referenceNumber}</p>}
        </div>
      ) : (
        <div className="flex justify-between gap-6 mb-8">
          <div className="flex-1">
            <InfoGrid
              labelWidth="80px"
              rows={[
                [t.number, letter.referenceNumber],
                [t.attachment, letter.attachment || '-'],
                [t.subject, <span className="font-bold">{letter.subject}</span>],
              ]}
            />
          </div>
          <div className="max-w-[45%]">
            <p className="text-right">{[letter.place, date].filter(Boolean).join(', ')}</p>
            <div className="mt-4">
              <p>{t.to}</p>
              <p className="font-bold">{letter.recipient.name}</p>
              {address && (address.includes('\n')
                ? <><p>{t.at}</p><p className="whitespace-pre-line pl-4">{address}</p></>
                : <p>{t.at} {address}</p>)}
            </div>
          </div>
        </div>
      )}
      <LetterBody letter={letter} type={type} lang="id" indent />
      <Signatures
        signatories={letter.signatories}
        align="center"
        close={letter.complimentaryClose}
        above={titled && (
          <div className="mb-4 flex justify-end">
            <InfoGrid labelWidth="110px" rows={([[t.issuedAt, letter.place], [t.issuedOn, date]] as InfoRow[]).filter(([, value]) => value)} />
          </div>
        )}
      />
    </>
  );
}
