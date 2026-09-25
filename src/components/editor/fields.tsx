import { useId, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import type { Letter } from '../../types/letter';

type ListPath = 'blocks.invitation.agenda' | 'blocks.request.items';
import { useT } from '../../i18n/lang';

const MAX_LOGO_BYTES = 300 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export const labelClasses = 'block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5';
export const inputClasses =
  'w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all';

export const Collapsible = ({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <div className="border-b border-zinc-200 py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex items-center justify-between w-full font-semibold text-zinc-700 hover:text-green-700 transition-colors"
      >
        {title}
        <span className="text-xl leading-none" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div id={panelId} className="mt-4 space-y-4">{children}</div>}
    </div>
  );
};

export const FormField = ({ label, name, type = 'text', isTextArea = false }: { label: string; name: Path<Letter>; type?: string; isTextArea?: boolean }) => {
  const { register } = useFormContext<Letter>();
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClasses}>{label}</label>
      {isTextArea ? (
        <textarea id={id} {...register(name)} rows={4} className={inputClasses} />
      ) : (
        <input id={id} {...register(name)} type={type} className={inputClasses} />
      )}
    </div>
  );
};

/** Editable list of one-line items (agenda points, requested items). */
export const ListField = ({ label, name }: { label: string; name: ListPath }) => {
  const t = useT();
  const { control, register } = useFormContext<Letter>();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      <span className={labelClasses}>{label}</span>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <input
            {...register(`${name}.${index}.text`)}
            aria-label={`${label} ${index + 1}`}
            className="flex-1 border border-zinc-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-zinc-400 hover:text-red-500 transition-colors px-2 font-bold"
            aria-label={`${t.actions.remove} ${label} ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ text: '' })}
        className="w-full py-2 border-2 border-dashed border-zinc-200 rounded-lg text-sm text-zinc-500 font-medium hover:border-green-300 hover:text-green-600 transition-all"
      >
        {t.actions.addItem}
      </button>
    </div>
  );
};

// Stored as a data URL so the logo travels with the saved letter and needs no network.
export const LogoField = () => {
  const t = useT();
  const { setValue, watch } = useFormContext<Letter>();
  const logo = watch('letterhead.logoDataUrl');
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setError(t.messages.logoType);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError(t.messages.logoSize);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      setValue('letterhead.logoDataUrl', reader.result as string, { shouldDirty: true });
    };
    reader.onerror = () => setError(t.messages.logoRead);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>{t.fields.logo}</label>
      <div className="flex items-center gap-3">
        {logo && <img src={logo} alt="" className="w-12 h-12 object-contain border border-zinc-200 rounded" />}
        <input
          id={id}
          type="file"
          accept={LOGO_TYPES.join(',')}
          onChange={onFile}
          className="flex-1 min-w-0 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200"
        />
        {logo && (
          <button
            type="button"
            onClick={() => setValue('letterhead.logoDataUrl', null, { shouldDirty: true })}
            aria-label={`${t.actions.remove} ${t.fields.logo}`}
            className="text-sm text-zinc-500 hover:text-red-600"
          >
            {t.actions.remove}
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};
