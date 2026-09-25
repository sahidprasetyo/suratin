import type { LetterTypeDef } from './types';

// Body text only: no editor section and no block of its own.
export const notice: LetterTypeDef<'notice'> = {
  id: 'notice',
  heading: 'correspondence',
  strings: { id: { name: 'Pemberitahuan' }, en: { name: 'Notice' } },
  sample: {
    id: {
      content: {
        referenceNumber: '013/YCN/IX/2026',
        subject: 'Pemberitahuan Penutupan Sementara Sekretariat',
        recipient: { name: 'Seluruh Anggota dan Mitra Yayasan', address: 'Tempat' },
        salutation: 'Dengan hormat,',
        body: 'Bersama surat ini kami beritahukan bahwa kantor sekretariat Yayasan Cendekia Nusantara akan ditutup sementara pada tanggal 13–15 Oktober 2026 karena kegiatan pemeliharaan gedung.\nLayanan administrasi akan kembali dibuka pada Jumat, 16 Oktober 2026 pukul 08.00 WIB. Untuk keperluan mendesak, silakan menghubungi sekretariat melalui surel sekretariat@example.com.',
        closingText: 'Demikian pemberitahuan ini kami sampaikan. Atas perhatiannya, kami ucapkan terima kasih.',
        complimentaryClose: 'Hormat kami,',
      },
      block: {},
    },
    en: {
      content: {
        referenceNumber: '013/NLF/IX/2026',
        subject: 'Temporary Closure of the Secretariat',
        recipient: { name: 'All Members and Partners', address: 'Nusantara Learning Foundation\nJakarta' },
        salutation: 'Dear Members and Partners,',
        body: 'Please be advised that the Nusantara Learning Foundation secretariat will be temporarily closed from 13 to 15 October 2026 for building maintenance.\nAdministrative services will resume on Friday, 16 October 2026 at 8:00 am. For urgent matters, please contact the secretariat at office@example.com.',
        closingText: 'Thank you for your understanding.',
        complimentaryClose: 'Yours sincerely,',
      },
      block: {},
    },
  },
};
