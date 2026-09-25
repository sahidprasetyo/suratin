import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Lang, Letter, LetterTypeId } from '../../types/letter';
import { strings } from '../../i18n/strings';
import IndonesianLayout from './IndonesianLayout';
import EnglishLayout from './EnglishLayout';
import PreviewBoundary from './PreviewBoundary';

const PAGE_WIDTH_PX = (210 / 25.4) * 96;
const LAYOUTS = { id: IndonesianLayout, en: EnglishLayout } satisfies Record<Lang, unknown>;

interface Props { letter: Letter; type: LetterTypeId; lang: Lang; onRecover: () => void; revision: number; className?: string }

export default function A4Preview({ letter, type, lang, onRecover, revision, className = '' }: Props) {
  const mainRef = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState(1);
  const t = strings[lang];
  const Layout = LAYOUTS[lang];

  // Shrink the sheet to fit narrow screens; print always resets to 1.
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width;
      if (available > 0) setZoom(Math.min(1, available / PAGE_WIDTH_PX));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <main
      ref={mainRef}
      className={`flex-1 min-h-0 bg-zinc-100 overflow-y-auto p-4 md:p-8 print:block print:p-0 print:bg-white print:overflow-visible ${className}`}
    >
      <div
        style={{ '--zoom': zoom } as CSSProperties}
        className="relative mx-auto bg-white shadow-2xl w-[210mm] min-h-[297mm] print:min-h-0 p-[20mm] box-decoration-clone font-serif text-[12pt] leading-normal [zoom:var(--zoom)] print:[zoom:1] print:shadow-none print:m-0 flex flex-col"
      >
        {/* Content crossing this line spills onto a second printed page. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[277mm] border-t border-dashed border-zinc-300 print:hidden"
        >
          <span className="absolute right-2 -top-4 font-sans text-[10px] text-zinc-400">{t.messages.pageEnds}</span>
        </div>
        <PreviewBoundary message={t.messages.previewFailed} actionLabel={t.actions.loadSample} onRecover={onRecover} resetKey={revision}>
          <Layout letter={letter} type={type} />
        </PreviewBoundary>
      </div>
    </main>
  );
}
