import type { Lang, LetterBlocks } from '../types/letter';
import type { LetterTypeDef } from './types';
import { useLang } from '../i18n/lang';
import { formatDate } from '../lib/formatDate';
import { FormField, ListField } from '../components/editor/fields';
import { InfoGrid } from '../components/preview/parts';
import type { InfoRow } from '../components/preview/parts';

const labels = {
  id: { eventDate: 'Hari / Tanggal', time: 'Waktu', location: 'Tempat', agenda: 'Acara' },
  en: { eventDate: 'Date', time: 'Time', location: 'Venue', agenda: 'Agenda' },
} satisfies Record<Lang, Record<string, string>>;

function InvitationEditor() {
  const l = labels[useLang()];
  return (
    <>
      <FormField label={l.eventDate} name="blocks.invitation.eventDate" type="date" />
      <FormField label={l.time} name="blocks.invitation.time" />
      <FormField label={l.location} name="blocks.invitation.location" />
      <ListField label={l.agenda} name="blocks.invitation.agenda" />
    </>
  );
}

function InvitationBlock({ block, lang }: { block: LetterBlocks['invitation']; lang: Lang }) {
  const l = labels[lang];
  const agenda = block.agenda.filter((item) => item.text.trim());
  const rows: InfoRow[] = [
    [l.eventDate, formatDate(block.eventDate, lang, { weekday: true })],
    [l.time, block.time],
    [l.location, block.location],
  ];
  if (agenda.length) {
    rows.push([l.agenda, <ol className="list-decimal ml-5">{agenda.map((item, i) => <li key={i}>{item.text}</li>)}</ol>]);
  }
  return <div className="ml-8"><InfoGrid rows={rows} /></div>;
}

export const invitation: LetterTypeDef<'invitation'> = {
  id: 'invitation',
  heading: 'correspondence',
  strings: { id: { name: 'Undangan' }, en: { name: 'Invitation' } },
  sample: {
    id: {
      content: {
        referenceNumber: '012/YCN/IX/2026',
        subject: 'Undangan Rapat Pengurus',
        recipient: { name: 'Bapak/Ibu Pengurus Yayasan', address: 'Tempat' },
        salutation: 'Dengan hormat,',
        body: 'Sehubungan dengan penyusunan program kerja tahun 2027, kami mengundang Bapak/Ibu untuk hadir pada rapat pengurus yang akan diselenggarakan pada:',
        closingText: 'Mengingat pentingnya acara tersebut, kami mengharapkan kehadiran Bapak/Ibu tepat waktu. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.',
        complimentaryClose: 'Hormat kami,',
      },
      block: {
        eventDate: '2026-10-03',
        time: '09.00 WIB – selesai',
        location: 'Ruang Rapat Lt. 2, Sekretariat Yayasan',
        agenda: [
          { text: 'Evaluasi program kerja 2026' },
          { text: 'Penyusunan program kerja 2027' },
          { text: 'Lain-lain' },
        ],
      },
    },
    en: {
      content: {
        referenceNumber: '012/NLF/IX/2026',
        subject: 'Invitation to the Board Meeting',
        recipient: { name: 'Board Members', address: 'Nusantara Learning Foundation\nJakarta' },
        salutation: 'Dear Board Members,',
        body: 'As we prepare the 2027 work programme, we would like to invite you to the board meeting, to be held as follows:',
        closingText: 'Given the importance of this meeting, we kindly ask you to arrive on time. Thank you for your attention and cooperation.',
        complimentaryClose: 'Yours sincerely,',
      },
      block: {
        eventDate: '2026-10-03',
        time: '9:00 am – 12:00 pm',
        location: 'Meeting Room, 2nd Floor, Foundation Secretariat',
        agenda: [
          { text: 'Review of the 2026 work programme' },
          { text: 'Drafting the 2027 work programme' },
          { text: 'Any other business' },
        ],
      },
    },
  },
  Editor: InvitationEditor,
  Block: InvitationBlock,
};
