import type { Lang, Letter, LetterTypeId } from '../../types/letter';
import { LETTER_TYPES } from '../../letters/registry';
import { Paragraphs } from './parts';

function TypeBlock<K extends LetterTypeId>({ type, letter, lang }: { type: K; letter: Letter; lang: Lang }) {
  const { Block } = LETTER_TYPES[type];
  return Block ? <Block block={letter.blocks[type]} lang={lang} /> : null;
}

/** Everything between the heading and the signatures; the complimentary close renders with the signatures. */
export default function LetterBody({ letter, type, lang, indent }: { letter: Letter; type: LetterTypeId; lang: Lang; indent: boolean }) {
  return (
    <div className="space-y-4">
      {letter.openingLine && <p className="text-center text-xl">{letter.openingLine}</p>}
      {letter.salutation && <p>{letter.salutation}</p>}
      <Paragraphs text={letter.body} indent={indent} />
      <TypeBlock type={type} letter={letter} lang={lang} />
      <Paragraphs text={letter.closingText} indent={indent} />
    </div>
  );
}
