import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LANGS, LETTER_TYPE_IDS } from '../../types/letter';
import type { Lang, LetterTypeId } from '../../types/letter';
import { LETTER_TYPES } from '../../letters/registry';
import { createSample } from '../../letters/samples';
import IndonesianLayout from './IndonesianLayout';
import EnglishLayout from './EnglishLayout';

const LAYOUTS = { id: IndonesianLayout, en: EnglishLayout };

const render = (type: LetterTypeId, lang: Lang, letter = createSample(type, lang)) => {
  const Layout = LAYOUTS[lang];
  // Strip tags so assertions read like the printed page.
  return renderToStaticMarkup(<Layout letter={letter} type={type} />).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
};

const combos = LETTER_TYPE_IDS.flatMap((type) => LANGS.map((lang) => [type, lang] as const));

describe('letter layouts', () => {
  it.each(combos)('%s / %s renders the sample cleanly', (type, lang) => {
    const text = render(type, lang);
    const letter = createSample(type, lang);
    expect(text).not.toMatch(/undefined|NaN|Invalid Date|\[object Object\]/);
    expect(text).toContain(letter.letterhead.name);
    expect(text).toContain(letter.signatories[0].name);
    expect(text).toContain(letter.referenceNumber);
  });

  it.each(combos)('%s / %s uses the right heading', (type, lang) => {
    const text = render(type, lang);
    const def = LETTER_TYPES[type];
    if (def.heading === 'titled') {
      expect(text).toContain(def.strings[lang].title);
      expect(text).not.toContain(lang === 'id' ? 'Kepada Yth.' : 'Subject:');
    } else if (lang === 'id') {
      expect(text).toMatch(/Nomor : .* Lampiran : .* Perihal :/);
      expect(text).toContain('Kepada Yth.');
      expect(text).toContain('Jakarta, 25 September 2026');
    } else {
      expect(text).toContain('Ref:');
      expect(text).toContain(`Subject: ${createSample(type, lang).subject}`);
      expect(text).not.toContain('Nomor');
    }
  });

  it('prints the invitation event date with weekday in each language', () => {
    expect(render('invitation', 'id')).toContain('Sabtu, 3 Oktober 2026');
    expect(render('invitation', 'en')).toMatch(/Saturday,? 3 October 2026/);
  });

  it('renders every assignee and the period', () => {
    const text = render('assignment', 'id');
    expect(text).toContain('Andi Pratama');
    expect(text).toContain('Rina Wulandari');
    expect(text).toMatch(/20\s*–\s*22 Oktober 2026/);
    expect(text).toContain('Dikeluarkan di');
  });

  it('shows optional parts only when they have content', () => {
    const letter = createSample('invitation', 'en');
    letter.attachment = 'Programme draft';
    expect(render('invitation', 'en', letter)).toContain('Enc.: Programme draft');
    expect(render('invitation', 'en', letter)).toContain('Agenda');

    letter.attachment = '';
    letter.blocks.invitation.agenda = [{ text: ' ' }];
    letter.date = '';
    const text = render('invitation', 'en', letter);
    expect(text).not.toContain('Enc.');
    expect(text).not.toContain('Agenda');
    expect(text).not.toContain('September 2026');
  });

  it('drops empty place or date from the Indonesian date line and issued block', () => {
    const letter = createSample('invitation', 'id');
    letter.date = '';
    expect(render('invitation', 'id', letter)).not.toMatch(/Jakarta,/);

    const titled = createSample('assignment', 'id');
    titled.place = '';
    expect(render('assignment', 'id', titled)).not.toContain('Dikeluarkan di');
    expect(render('assignment', 'id', titled)).toContain('Pada tanggal');
    titled.place = 'Jakarta';
    titled.date = '';
    expect(render('assignment', 'id', titled)).toContain('Dikeluarkan di');
    expect(render('assignment', 'id', titled)).not.toContain('Pada tanggal');
  });

  it('keeps the complimentary close inside the unbreakable signature block', () => {
    for (const lang of ['id', 'en'] as const) {
      const letter = createSample('invitation', lang);
      const markup = renderToStaticMarkup(lang === 'id'
        ? <IndonesianLayout letter={letter} type="invitation" />
        : <EnglishLayout letter={letter} type="invitation" />);
      const block = markup.slice(markup.indexOf('break-inside-avoid'));
      expect(block).toContain(letter.complimentaryClose);
    }
  });

  it('puts "di" on its own line before a multi-line Indonesian address', () => {
    const letter = createSample('invitation', 'id');
    const markup = (l: typeof letter) => renderToStaticMarkup(<IndonesianLayout letter={l} type="invitation" />);
    expect(markup(letter)).toContain('<p>di Tempat</p>');
    letter.recipient.address = 'Jl. Contoh No. 2\nJakarta';
    expect(markup(letter)).toContain('<p>di</p>');
  });

  it('shows the optional opening line only when set', () => {
    const letter = createSample('notice', 'id');
    expect(render('notice', 'id', letter)).not.toContain('Om Swastiastu');
    letter.openingLine = 'Om Swastiastu';
    expect(render('notice', 'id', letter)).toContain('Om Swastiastu');
  });
});
