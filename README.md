# Suratin

*Print-ready official letters in Bahasa Indonesia and English.*

**Live demo:** https://sahidprasetyo.github.io/suratin/

Fill in a form, watch a live A4 preview, and print or save as PDF. It has no backend and no accounts, and your letter stays in your browser.

## Features

- **Four letter types:** Invitation (*Undangan*), Notice (*Pemberitahuan*), Request (*Permohonan*), Assignment (*Surat Tugas*).
- **Native layout per language.** Indonesian letters use the *Nomor / Lampiran / Perihal* heading and *Kepada Yth.* block. English letters use a block-style business layout (Ref, date, recipient address, Subject, "Dear …", "Yours sincerely"). One switch changes both the letter and the editor interface.
- **Live A4 preview** that prints cleanly. Margins repeat on every printed page, and a guide line shows where page 1 ends.
- **Autosave** to the browser, so a refresh never loses work.
- **Mobile-friendly.** Edit / Preview / Print tabs on small screens, with the page scaled to fit.
- **Dates formatted per language** with `Intl` (e.g. *Sabtu, 3 Oktober 2026* / *Saturday, 3 October 2026*), including date ranges.
- **Logo upload** (PNG, JPG or SVG, up to 300 KB), stored with the letter, so no network request is needed.
- **Organisation-neutral.** Religious or ceremonial openings (e.g. *Bismillah*, *Om Swastiastu*) go in an optional "opening line" field instead of being hardcoded.

## Getting started

### Prerequisites

- **Node.js 22.12 or newer.** Vitest requires it; Vite alone needs 20.19+.
- **pnpm 12.** The exact version is pinned in `package.json` under `packageManager`. `corepack enable` installs it automatically.

### Run locally

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

### Scripts

| Command        | What it does                                           |
| -------------- | ------------------------------------------------------ |
| `pnpm dev`     | Start the Vite dev server                              |
| `pnpm build`   | Type-check (`tsc -b`) and build to `dist/`             |
| `pnpm preview` | Serve the production build at `/suratin/`              |
| `pnpm test`    | Run the Vitest suite                                   |
| `pnpm lint`    | Run ESLint                                             |

The build output in `dist/` is static files. Production builds use the base path `/suratin/` (set in `vite.config.ts`); change it to `/` to host at a domain root.

### Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which lints, tests, builds and publishes the site to GitHub Pages. A failing check stops the deploy. The workflow:

- pins each action to a full commit SHA, so a moved tag can't change what runs
- gives the build job read-only access; only the deploy job can write to Pages
- installs the exact pnpm version pinned in `package.json` via Corepack, with a frozen lockfile

One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**. Deploys can also be started manually from the **Actions** tab (*Run workflow*).

### Printing and saving as PDF

Use **Print / Save as PDF**, choose *Save as PDF* (or a printer), paper size **A4**, and scale **100%**. The page title is set to the letter's subject, so the PDF gets a sensible file name. On phones, use the **Print / PDF** tab. It prints the full-size letter even while you're on the Edit tab.

## How it works

```
src/
├── App.tsx                    State: language, letter type, form; autosave; switching
├── types/letter.ts            Letter data model and the lists of languages / types
├── letters/
│   ├── registry.ts            LETTER_TYPES: the one list of available types
│   ├── invitation.tsx …       One file per type: labels, ID/EN samples, editor, preview block
│   ├── samples.ts             createSample(type, lang): shared parts + the type's parts
│   └── types.ts               LetterTypeDef contract
├── components/
│   ├── editor/                Sidebar and form primitives (react-hook-form)
│   └── preview/               A4 frame, IndonesianLayout, EnglishLayout, shared parts
├── i18n/                      UI and letter strings (ID + EN), language context
└── lib/
    ├── formatDate.ts          Local-date parsing and Intl formatting
    ├── storage.ts             localStorage load/save with a structural validity check
    └── switching.ts           Rules for changing language or letter type
```

**Data model.** A letter has a *shared* part (letterhead, reference, date, recipient, greetings, signatories) and a *block* for each type (event details, requested items, assignees). All four blocks are always stored, so switching type and back never loses data, and the form's shape never changes. Only the current type's block is rendered.

**Layouts.** `IndonesianLayout` and `EnglishLayout` render the shared part in each language's conventions and insert the current type's `Block` in the middle. A type declares `heading: 'correspondence'` (reference/subject plus recipient) or `'titled'` (a centred title such as *SURAT TUGAS*, with no recipient).

**Switching language or type** never overwrites text you typed:

- If the letter is still the untouched sample, switching loads the matching sample.
- If you've edited it, your text stays. Switching language shows a notice that your text wasn't translated, with a one-click option to load the sample instead.
- "Untouched" is decided by comparing against the sample, not react-hook-form's `isDirty`, which resets after a page reload.

**i18n** uses a typed dictionary instead of a library. `en` is typed as `typeof id`, so a string missing from either language fails the build.

### Adding a letter type

1. In `src/types/letter.ts`, add the id to `LETTER_TYPE_IDS` and its block shape to `LetterBlocks`.
2. Create `src/letters/<type>.tsx` exporting a `LetterTypeDef`: names and optional title per language, a sample per language, and optionally an `Editor` and a preview `Block`. `notice.tsx` is the minimal example; `assignment.tsx` shows a table block.
3. Register it in `src/letters/registry.ts`.

The compiler flags anything missing: a language without strings or a sample, or a block without a type. Saved letters are repaired against the samples, so give every list in the new block at least one sample item. That item defines the shape the list's other items are repaired to.

## Testing

`pnpm test` runs Vitest in a Node environment. Preview components are rendered with `react-dom/server`, so there's no jsdom.

| Test file                                | Covers                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `lib/formatDate.test.ts`                 | ID/EN formatting, the off-by-one-day bug west of UTC (sets its own `TZ`), invalid input, ranges |
| `lib/storage.test.ts`                    | Round trip; repair; backups (never overwritten); failed backup flagged; no letter text in logs  |
| `lib/switching.test.ts`                  | Untouched → new sample; edited text kept on language and type switches                         |
| `components/preview/render.test.tsx`     | All 4 types × 2 languages render with the right headings and never show `undefined` / `NaN`    |
| `i18n/strings.test.ts`                   | No empty strings in either language                                                            |

## Privacy and security

- **Everything stays on the device.** The letter is saved only to this browser's `localStorage` (key `letter-builder:v2`). Nothing is sent anywhere, and the app makes no network requests. On a shared computer, clear the site's data in the browser when you're done.
- **No HTML injection.** All user text is rendered through React, which escapes it. The code never uses `dangerouslySetInnerHTML`.
- **Logo uploads** accept only PNG, JPEG and SVG up to 300 KB and are shown with `<img>`, where SVG scripts don't run.
- **Saved data is checked on load.** A partial or hand-edited letter is repaired: missing text becomes empty, broken list items are dropped, and a logo that isn't an image data URL is removed. Whenever the stored data has to be repaired or replaced (for example corrupt JSON or an unknown version), the original is first copied to a timestamped key, `letter-builder:v2:backup:<time>`, so earlier backups are never replaced. If even that backup can't be written (storage full), autosave pauses with a warning and only resumes when you choose to overwrite the old data. Console warnings never include letter content.
- **Errors are visible, never silent.** A failed save shows a warning in the sidebar. If the preview hits a rendering error, it shows a message, the editor stays usable, and the preview retries on your next edit.

## Browser support and limitations

- Verified in Chrome, including print-to-PDF. It relies on CSS `zoom` (Firefox 126+, Safari, Chromium) and `box-decoration-break` for margins on every printed page.
- Your text isn't machine-translated. Switching language changes the layout, labels and date format only.
- One letter is saved at a time, with no archive or auto-numbering.
- English letters follow British conventions (`en-GB` dates, "Yours sincerely / faithfully").

## License

[MIT](LICENSE) © 2026 sahidprasetyo
