import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import type { Lang, Letter, LetterTypeId } from './types/letter';
import { LangContext } from './i18n/lang';
import { strings } from './i18n/strings';
import { LETTER_TYPES } from './letters/registry';
import { createSample } from './letters/samples';
import { loadState, saveState } from './lib/storage';
import { switchLetter } from './lib/switching';
import type { LetterKind } from './lib/switching';
import SidebarEditor from './components/editor/SidebarEditor';
import A4Preview from './components/preview/A4Preview';

type MobileView = 'edit' | 'preview';

function App() {
  const [{ state: initial, backupFailed }] = useState(loadState);
  const [lang, setLang] = useState<Lang>(initial.lang);
  const [type, setType] = useState<LetterTypeId>(initial.type);
  const methods = useForm<Letter>({ defaultValues: initial.letter });
  const [view, setView] = useState<MobileView>('edit');
  const [saveFailed, setSaveFailed] = useState(false);
  const [showUntranslated, setShowUntranslated] = useState(false);
  // On when stored data couldn't be backed up; saving would destroy the only copy.
  const [autosavePaused, setAutosavePaused] = useState(backupFailed);
  // Bumped on every save; lets the preview's error boundary retry after the next edit.
  const [revision, setRevision] = useState(0);
  // Read by the save callback, which methods.reset() fires before the new lang/type state commits.
  const kindRef = useRef<LetterKind>({ type: initial.type, lang: initial.lang });

  const letter = methods.watch();
  const t = strings[lang];
  const def = LETTER_TYPES[type];

  // Save on every edit and whenever the language or type changes.
  useEffect(() => {
    const persist = () => {
      if (!autosavePaused) setSaveFailed(!saveState({ version: 2, ...kindRef.current, letter: methods.getValues() }));
      setRevision((r) => r + 1);
    };
    persist();
    const sub = methods.watch(persist);
    return () => sub.unsubscribe();
  }, [methods, lang, type, autosavePaused]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // The browser uses the page title as the default "Save as PDF" filename.
  const docTitle = (def.heading === 'titled' ? `${def.strings[lang].title} ${letter.referenceNumber}` : letter.subject)?.trim() || t.app.title;
  useEffect(() => {
    document.title = docTitle;
  }, [docTitle]);

  const handleSwitch = (next: LetterKind) => {
    const current = methods.getValues();
    const result = switchLetter(current, { type, lang }, next);
    kindRef.current = next;
    if (result.letter !== current) methods.reset(result.letter);
    setShowUntranslated(result.showUntranslatedNotice);
    setType(next.type);
    setLang(next.lang);
  };

  const loadSample = () => {
    if (!window.confirm(t.actions.loadSampleConfirm)) return;
    methods.reset(createSample(type, lang));
    setShowUntranslated(false);
  };

  const tabClass = (active: boolean) =>
    `py-3 text-sm font-semibold ${active ? 'text-green-700' : 'text-zinc-500'}`;

  return (
    <LangContext value={lang}>
      <FormProvider {...methods}>
        <div className="flex h-dvh flex-col overflow-hidden md:flex-row print:block print:h-auto print:overflow-visible">
          <SidebarEditor
            type={type}
            onSwitch={handleSwitch}
            onLoadSample={loadSample}
            saveFailed={saveFailed}
            autosavePaused={autosavePaused}
            onResumeAutosave={() => setAutosavePaused(false)}
            showUntranslated={showUntranslated}
            onDismissUntranslated={() => setShowUntranslated(false)}
            className={view === 'preview' ? 'hidden md:flex' : 'flex'}
          />
          <A4Preview
            letter={letter}
            type={type}
            lang={lang}
            onRecover={loadSample}
            revision={revision}
            className={view === 'edit' ? 'hidden md:block' : 'block'}
          />
          <nav className="grid grid-cols-3 border-t border-zinc-200 bg-white md:hidden print:hidden">
            <button type="button" onClick={() => setView('edit')} className={tabClass(view === 'edit')} aria-pressed={view === 'edit'}>
              {t.actions.edit}
            </button>
            <button type="button" onClick={() => setView('preview')} className={tabClass(view === 'preview')} aria-pressed={view === 'preview'}>
              {t.actions.preview}
            </button>
            <button type="button" onClick={() => window.print()} className="py-3 text-sm font-bold text-white bg-green-600">
              {t.actions.printShort}
            </button>
          </nav>
        </div>
      </FormProvider>
    </LangContext>
  );
}

export default App;
