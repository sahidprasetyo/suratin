import type { ReactNode } from 'react';
import type { Letter, Signatory } from '../../types/letter';

export type InfoRow = [label: string, value: ReactNode];

/** "Label : value" rows with aligned colons, the standard Indonesian letter layout. */
export const InfoGrid = ({ rows, labelWidth = '120px' }: { rows: InfoRow[]; labelWidth?: string }) => (
  <div className="grid gap-y-1" style={{ gridTemplateColumns: `${labelWidth} 1.25rem 1fr` }}>
    {rows.map(([label, value]) => (
      <div key={label} className="contents">
        <span>{label}</span><span>:</span><div>{value}</div>
      </div>
    ))}
  </div>
);

/** One <p> per line so every paragraph gets its own first-line indent. */
export const Paragraphs = ({ text, indent }: { text: string; indent: boolean }) => (
  <>
    {text.split('\n').filter((line) => line.trim()).map((line, i) => (
      <p key={i} className={`text-justify ${indent ? 'indent-8' : ''}`}>{line}</p>
    ))}
  </>
);

export const Letterhead = ({ letterhead }: { letterhead: Letter['letterhead'] }) => (
  <header className="flex items-center gap-4 border-b-4 border-double border-zinc-800 pb-4 mb-8">
    {letterhead.logoDataUrl && (
      <img src={letterhead.logoDataUrl} alt="Logo" className="w-24 h-24 object-contain" />
    )}
    <div className="flex-1 text-center">
      <h1 className="text-xl font-bold leading-tight">{letterhead.name}</h1>
      {letterhead.subName && <h2 className="text-lg font-semibold leading-tight">{letterhead.subName}</h2>}
      {letterhead.address && <p className="text-[10pt] text-zinc-700 mt-1 whitespace-pre-line">{letterhead.address}</p>}
    </div>
  </header>
);

const COLUMNS = ['grid-cols-1', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3'];

// The signing gap is its own element so an empty role header doesn't remove it.
const SignatureBlock = ({ sig }: { sig: Signatory }) => (
  <div>
    <p className="min-h-[1.5em]">{sig.roleHeader}</p>
    <div className="h-20" aria-hidden="true" />
    <p className="font-bold underline">{sig.name}</p>
    {sig.roleTitle && <p>{sig.roleTitle}</p>}
  </div>
);

/**
 * center: Indonesian convention, a lone signatory sits in the right half.
 * start: English convention, signatures are left-aligned under the close.
 * The close is rendered here, inside break-inside-avoid, so it never ends a page alone.
 */
export const Signatures = ({ signatories, align, close, above }: { signatories: Signatory[]; align: 'center' | 'start'; close?: string; above?: ReactNode }) => {
  const lone = signatories.length === 1 && align === 'center';
  const gap = align === 'center' ? 'mt-10' : 'mt-2';
  return (
    <div className={`break-inside-avoid ${close ? 'mt-4' : gap} ${lone ? 'ml-auto w-1/2' : ''}`}>
      {close && <p className={align === 'center' ? 'mb-10' : 'mb-2'}>{close}</p>}
      {above}
      <div className={`grid gap-6 ${COLUMNS[signatories.length] ?? 'grid-cols-3'} ${align === 'center' ? 'text-center' : 'text-left'}`}>
        {signatories.map((sig, i) => <SignatureBlock key={i} sig={sig} />)}
      </div>
    </div>
  );
};
