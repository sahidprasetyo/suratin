import type { Lang, LetterBlocks } from '../types/letter';
import type { LetterTypeDef } from './types';
import { useLang } from '../i18n/lang';
import { ListField } from '../components/editor/fields';

const labels = {
  id: { items: 'Butir yang dimohon' },
  en: { items: 'Items requested' },
} satisfies Record<Lang, Record<string, string>>;

function RequestEditor() {
  const l = labels[useLang()];
  return <ListField label={l.items} name="blocks.request.items" />;
}

function RequestBlock({ block }: { block: LetterBlocks['request']; lang: Lang }) {
  const items = block.items.filter((item) => item.text.trim());
  if (!items.length) return null;
  return (
    <ol className="list-decimal ml-14">
      {items.map((item, i) => <li key={i}>{item.text}</li>)}
    </ol>
  );
}

export const request: LetterTypeDef<'request'> = {
  id: 'request',
  heading: 'correspondence',
  strings: { id: { name: 'Permohonan' }, en: { name: 'Request' } },
  sample: {
    id: {
      content: {
        referenceNumber: '015/YCN/IX/2026',
        subject: 'Permohonan Peminjaman Peralatan',
        recipient: { name: 'Kepala Bagian Sarana dan Prasarana Perpustakaan Kota', address: 'Tempat' },
        salutation: 'Dengan hormat,',
        body: 'Dalam rangka pelaksanaan kegiatan Pekan Literasi Anak pada tanggal 17–18 Oktober 2026, kami bermaksud meminjam peralatan sebagai berikut:',
        closingText: 'Peralatan tersebut akan kami kembalikan dalam kondisi baik selambat-lambatnya tanggal 19 Oktober 2026. Besar harapan kami agar permohonan ini dapat dikabulkan. Atas perhatian dan bantuannya, kami ucapkan terima kasih.',
        complimentaryClose: 'Hormat kami,',
      },
      block: {
        items: [
          { text: '1 unit proyektor beserta layar' },
          { text: '2 unit pengeras suara portabel' },
          { text: '40 kursi lipat' },
        ],
      },
    },
    en: {
      content: {
        referenceNumber: '015/NLF/IX/2026',
        subject: 'Request to Borrow Equipment',
        recipient: { name: 'Head of Facilities', address: 'City Library\nJakarta' },
        salutation: 'Dear Sir or Madam,',
        body: "For our Children's Literacy Week on 17–18 October 2026, we would like to borrow the following equipment:",
        closingText: 'We will return the equipment in good condition no later than 19 October 2026. We would be grateful if you could grant this request.',
        complimentaryClose: 'Yours faithfully,',
      },
      block: {
        items: [
          { text: '1 projector and screen' },
          { text: '2 portable speakers' },
          { text: '40 folding chairs' },
        ],
      },
    },
  },
  Editor: RequestEditor,
  Block: RequestBlock,
};
