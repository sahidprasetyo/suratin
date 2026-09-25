import { useFieldArray, useFormContext } from 'react-hook-form';
import type { Lang, Letter, LetterBlocks } from '../types/letter';
import type { LetterTypeDef } from './types';
import { useLang, useT } from '../i18n/lang';
import { formatDateRange } from '../lib/formatDate';
import { FormField, inputClasses, labelClasses } from '../components/editor/fields';
import { InfoGrid } from '../components/preview/parts';

const labels = {
  id: {
    assignees: 'Petugas', no: 'No.', name: 'Nama', idNumber: 'NIP / No. Induk', position: 'Jabatan',
    purpose: 'Untuk', startDate: 'Tanggal mulai', endDate: 'Tanggal selesai', period: 'Waktu', location: 'Tempat',
    addAssignee: '+ Tambah petugas',
  },
  en: {
    assignees: 'Assignees', no: 'No.', name: 'Name', idNumber: 'ID No.', position: 'Position',
    purpose: 'Purpose', startDate: 'Start date', endDate: 'End date', period: 'Period', location: 'Location',
    addAssignee: '+ Add assignee',
  },
} satisfies Record<Lang, Record<string, string>>;

function AssignmentEditor() {
  const l = labels[useLang()];
  const t = useT();
  const { control, register } = useFormContext<Letter>();
  const { fields, append, remove } = useFieldArray({ control, name: 'blocks.assignment.assignees' });

  return (
    <>
      <div className="space-y-3">
        <span className={labelClasses}>{l.assignees}</span>
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 bg-zinc-50 rounded-lg space-y-2">
            <input {...register(`blocks.assignment.assignees.${index}.name`)} placeholder={l.name} aria-label={`${l.name} ${index + 1}`} className={inputClasses} />
            <input {...register(`blocks.assignment.assignees.${index}.idNumber`)} placeholder={l.idNumber} aria-label={`${l.idNumber} ${index + 1}`} className={inputClasses} />
            <input {...register(`blocks.assignment.assignees.${index}.position`)} placeholder={l.position} aria-label={`${l.position} ${index + 1}`} className={inputClasses} />
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label={`${t.actions.remove} ${l.assignees} ${index + 1}`}
              className="text-sm text-zinc-500 hover:text-red-600 disabled:opacity-40 disabled:hover:text-zinc-500"
            >
              {t.actions.remove}
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: '', idNumber: '', position: '' })}
          className="w-full py-2 border-2 border-dashed border-zinc-200 rounded-lg text-sm text-zinc-500 font-medium hover:border-green-300 hover:text-green-600 transition-all"
        >
          {l.addAssignee}
        </button>
      </div>
      <FormField label={l.purpose} name="blocks.assignment.purpose" isTextArea />
      <FormField label={l.startDate} name="blocks.assignment.startDate" type="date" />
      <FormField label={l.endDate} name="blocks.assignment.endDate" type="date" />
      <FormField label={l.location} name="blocks.assignment.location" />
    </>
  );
}

const cell = 'border border-zinc-800 px-2 py-1 text-left align-top';

function AssignmentBlock({ block, lang }: { block: LetterBlocks['assignment']; lang: Lang }) {
  const l = labels[lang];
  return (
    <div className="space-y-4">
      <table className="w-full border-collapse break-inside-avoid">
        <thead>
          <tr>
            <th className={`${cell} w-10`}>{l.no}</th>
            <th className={cell}>{l.name}</th>
            <th className={cell}>{l.idNumber}</th>
            <th className={cell}>{l.position}</th>
          </tr>
        </thead>
        <tbody>
          {block.assignees.map((a, i) => (
            <tr key={i}>
              <td className={cell}>{i + 1}.</td>
              <td className={cell}>{a.name}</td>
              <td className={cell}>{a.idNumber}</td>
              <td className={cell}>{a.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <InfoGrid
        labelWidth="80px"
        rows={[
          [l.purpose, <span className="whitespace-pre-line">{block.purpose}</span>],
          [l.period, formatDateRange(block.startDate, block.endDate, lang)],
          [l.location, block.location],
        ]}
      />
    </div>
  );
}

export const assignment: LetterTypeDef<'assignment'> = {
  id: 'assignment',
  heading: 'titled',
  strings: {
    id: { name: 'Surat Tugas', title: 'Surat Tugas' },
    en: { name: 'Assignment', title: 'Letter of Assignment' },
  },
  sample: {
    id: {
      content: {
        referenceNumber: '014/YCN/ST/IX/2026',
        subject: 'Surat Tugas Pelatihan Manajemen Program',
        recipient: { name: '', address: '' },
        salutation: '',
        body: 'Yang bertanda tangan di bawah ini, Ketua Yayasan Cendekia Nusantara, dengan ini menugaskan kepada:',
        closingText: 'Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.',
        complimentaryClose: '',
      },
      block: {
        assignees: [
          { name: 'Andi Pratama', idNumber: 'YCN-0123', position: 'Koordinator Program' },
          { name: 'Rina Wulandari', idNumber: 'YCN-0147', position: 'Staf Administrasi' },
        ],
        purpose: 'Mengikuti Pelatihan Manajemen Program Pendidikan',
        startDate: '2026-10-20',
        endDate: '2026-10-22',
        location: 'Bandung',
      },
    },
    en: {
      content: {
        referenceNumber: '014/NLF/LA/IX/2026',
        subject: 'Assignment: Programme Management Training',
        recipient: { name: '', address: '' },
        salutation: '',
        body: 'I, the undersigned, Chair of the Nusantara Learning Foundation, hereby assign the following staff:',
        closingText: 'This letter is issued to be carried out with full responsibility.',
        complimentaryClose: '',
      },
      block: {
        assignees: [
          { name: 'Andi Pratama', idNumber: 'NLF-0123', position: 'Programme Coordinator' },
          { name: 'Rina Wulandari', idNumber: 'NLF-0147', position: 'Administrative Officer' },
        ],
        purpose: 'To attend the Education Programme Management Training',
        startDate: '2026-10-20',
        endDate: '2026-10-22',
        location: 'Bandung',
      },
    },
  },
  Editor: AssignmentEditor,
  Block: AssignmentBlock,
};
