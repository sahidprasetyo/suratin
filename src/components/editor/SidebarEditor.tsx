import { useId } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { LANGS, LETTER_TYPE_IDS, MAX_SIGNATORIES } from '../../types/letter';
import type { Lang, Letter, LetterTypeId } from '../../types/letter';
import type { LetterKind } from '../../lib/switching';
import { LETTER_TYPES } from '../../letters/registry';
import { useLang, useT } from '../../i18n/lang';
import { Collapsible, FormField, LogoField, inputClasses, labelClasses } from './fields';

const LANG_LABELS: Record<Lang, { short: string; full: string }> = {
  id: { short: 'ID', full: 'Bahasa Indonesia' },
  en: { short: 'EN', full: 'English' },
};

const SignatoriesEditor = () => {
  const t = useT();
  const { control } = useFormContext<Letter>();
  const { fields, append, remove } = useFieldArray({ control, name: 'signatories' });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="p-3 bg-zinc-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-400 uppercase">{t.fields.signatory} {index + 1}</h4>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label={`${t.actions.remove} ${t.fields.signatory} ${index + 1}`}
              className="text-sm text-zinc-500 hover:text-red-600 disabled:opacity-40 disabled:hover:text-zinc-500"
            >
              {t.actions.remove}
            </button>
          </div>
          <FormField label={t.fields.roleHeader} name={`signatories.${index}.roleHeader`} />
          <FormField label={t.fields.signatoryName} name={`signatories.${index}.name`} />
          <FormField label={t.fields.roleTitle} name={`signatories.${index}.roleTitle`} />
        </div>
      ))}
      {fields.length < MAX_SIGNATORIES && (
        <button
          type="button"
          onClick={() => append({ roleHeader: '', name: '', roleTitle: '' })}
          className="w-full py-2 border-2 border-dashed border-zinc-200 rounded-lg text-sm text-zinc-500 font-medium hover:border-green-300 hover:text-green-600 transition-all"
        >
          {t.actions.addSignatory}
        </button>
      )}
    </div>
  );
};

interface Props {
  type: LetterTypeId;
  onSwitch: (next: LetterKind) => void;
  onLoadSample: () => void;
  saveFailed: boolean;
  autosavePaused: boolean;
  onResumeAutosave: () => void;
  showUntranslated: boolean;
  onDismissUntranslated: () => void;
  className?: string;
}

export default function SidebarEditor({ type, onSwitch, onLoadSample, saveFailed, autosavePaused, onResumeAutosave, showUntranslated, onDismissUntranslated, className = '' }: Props) {
  const t = useT();
  const lang = useLang();
  const typeSelectId = useId();
  const def = LETTER_TYPES[type];
  const TypeEditor = def.Editor;
  const correspondence = def.heading === 'correspondence';

  return (
    <aside className={`flex-1 min-h-0 w-full md:flex-none md:w-[400px] border-r border-zinc-200 bg-white overflow-y-auto flex-col print:hidden ${className}`}>
      <div className="p-6 border-b border-zinc-100 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-800">{t.app.title}</h2>
            <p className="text-sm text-zinc-500 mt-1">{t.app.subtitle}</p>
          </div>
          <div role="group" aria-label={t.app.language} className="flex rounded-lg border border-zinc-300 p-0.5">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onSwitch({ type, lang: l })}
                aria-pressed={l === lang}
                aria-label={`${LANG_LABELS[l].short} – ${LANG_LABELS[l].full}`}
                lang={l}
                className={`px-2.5 py-1 text-xs font-bold rounded-md ${l === lang ? 'bg-green-600 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                {LANG_LABELS[l].short}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor={typeSelectId} className={labelClasses}>{t.app.letterType}</label>
          <select
            id={typeSelectId}
            value={type}
            onChange={(e) => onSwitch({ type: e.target.value as LetterTypeId, lang })}
            className={inputClasses}
          >
            {LETTER_TYPE_IDS.map((id) => (
              <option key={id} value={id}>{LETTER_TYPES[id].strings[lang].name}</option>
            ))}
          </select>
        </div>
        {showUntranslated && (
          <div role="status" className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <p className="flex-1">
              {t.messages.untranslated}{' '}
              <button type="button" onClick={onLoadSample} className="font-semibold underline">{t.actions.loadSampleInLang}</button>
            </p>
            <button type="button" onClick={onDismissUntranslated} aria-label={t.actions.dismiss} className="font-bold">×</button>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 space-y-2">
        <Collapsible title={t.sections.letterhead} defaultOpen>
          <FormField label={t.fields.orgName} name="letterhead.name" />
          <FormField label={t.fields.orgSubName} name="letterhead.subName" />
          <LogoField />
          <FormField label={t.fields.address} name="letterhead.address" isTextArea />
        </Collapsible>

        <Collapsible title={t.sections.details}>
          <FormField label={t.fields.referenceNumber} name="referenceNumber" />
          {correspondence && <FormField label={t.fields.attachment} name="attachment" />}
          {correspondence && <FormField label={t.fields.subject} name="subject" />}
          {/* English letters don't print a place; Indonesian ones use it in the date line. */}
          {lang === 'id' && <FormField label={t.fields.place} name="place" />}
          <FormField label={t.fields.date} name="date" type="date" />
        </Collapsible>

        {correspondence && (
          <Collapsible title={t.sections.recipient}>
            <FormField label={t.fields.recipientName} name="recipient.name" />
            <FormField label={t.fields.recipientAddress} name="recipient.address" isTextArea />
          </Collapsible>
        )}

        <Collapsible title={t.sections.content}>
          <FormField label={t.fields.openingLine} name="openingLine" />
          <FormField label={t.fields.salutation} name="salutation" />
          <FormField label={t.fields.body} name="body" isTextArea />
          <FormField label={t.fields.closingText} name="closingText" isTextArea />
          <FormField label={t.fields.complimentaryClose} name="complimentaryClose" />
        </Collapsible>

        {TypeEditor && (
          <Collapsible title={def.strings[lang].name}>
            <TypeEditor />
          </Collapsible>
        )}

        <Collapsible title={t.sections.signatories}>
          <SignatoriesEditor />
        </Collapsible>
      </div>

      <div className="p-6 bg-zinc-50 border-t border-zinc-200 space-y-3">
        {autosavePaused && (
          <div role="alert" className="space-y-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <p>{t.messages.autosavePaused}</p>
            <button type="button" onClick={onResumeAutosave} className="font-semibold underline">{t.actions.resumeAutosave}</button>
          </div>
        )}
        {saveFailed && <p role="alert" className="text-xs text-red-600">{t.messages.saveFailed}</p>}
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-200"
        >
          {t.actions.print}
        </button>
        <button
          type="button"
          onClick={onLoadSample}
          className="w-full py-2 text-sm text-zinc-500 hover:text-red-600 transition-colors"
        >
          {t.actions.loadSample}
        </button>
      </div>
    </aside>
  );
}
