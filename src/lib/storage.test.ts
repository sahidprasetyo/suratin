import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSample } from '../letters/samples';
import { BACKUP_PREFIX, STORAGE_KEY, freshState, loadState as loadResult, saveState } from './storage';

const loadState = () => loadResult().state;
const backups = () => Object.keys(store).filter((k) => k.startsWith(BACKUP_PREFIX)).map((k) => store[k]);

let store: Record<string, string> = {};
const memoryStorage = () => {
  store = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => void (store[key] = value),
    removeItem: (key: string) => void delete store[key],
    clear: () => void (store = {}),
  };
};

/** A saved state with one real edit, then `mutate` applied to its raw JSON form. */
const savedWith = (mutate: (letter: Record<string, unknown>) => void) => {
  const letter = JSON.parse(JSON.stringify({ ...createSample('invitation', 'en'), subject: 'My subject' }));
  mutate(letter);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, lang: 'en', type: 'invitation', letter }));
};

describe('storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('round-trips a saved state unchanged, without making a backup', () => {
    const state = { ...freshState('id'), type: 'assignment' as const };
    state.letter.subject = 'Edited';
    expect(saveState(state)).toBe(true);
    expect(loadResult()).toEqual({ state, backupFailed: false });
    expect(backups()).toEqual([]);
  });

  it('returns a fresh sample when nothing is saved', () => {
    expect(loadResult()).toEqual({ state: freshState(), backupFailed: false });
    expect(backups()).toEqual([]);
  });

  it.each([
    ['corrupt JSON', '{broken'],
    ['wrong version', JSON.stringify({ ...freshState('en'), version: 1 })],
    ['unknown type', JSON.stringify({ ...freshState('en'), type: 'memo' })],
    ['unknown language', JSON.stringify({ ...freshState('en'), lang: 'fr' })],
  ])('backs up and falls back to a sample on %s', (_label, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(loadState()).toEqual(freshState());
    expect(backups()).toEqual([raw]);
  });

  it('keeps every backup instead of replacing an earlier one', () => {
    localStorage.setItem(STORAGE_KEY, '{first');
    loadState();
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);
    localStorage.setItem(STORAGE_KEY, '{second');
    loadState();
    expect(backups().sort()).toEqual(['{first', '{second']);
  });

  it('flags a failed backup so autosave cannot destroy the only copy', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', {
      ...storage,
      setItem: (key: string, value: string) => {
        if (key.startsWith(BACKUP_PREFIX)) throw new DOMException('quota', 'QuotaExceededError');
        storage.setItem(key, value);
      },
    });
    localStorage.setItem(STORAGE_KEY, '{broken');
    expect(loadResult().backupFailed).toBe(true);
    savedWith((l) => { delete l.body; });
    expect(loadResult().backupFailed).toBe(true);
  });

  it('never logs letter content', () => {
    localStorage.setItem(STORAGE_KEY, 'Budi Santoso, Jl. Contoh');
    loadState();
    const logged = JSON.stringify(vi.mocked(console.warn).mock.calls);
    expect(logged).not.toContain('Budi');
  });

  describe('repairs a partial letter instead of discarding it', () => {
    it('fills missing text with empty strings, keeps the edits, and backs up the original', () => {
      savedWith((l) => { delete l.body; delete l.recipient; });
      const raw = localStorage.getItem(STORAGE_KEY);
      const { letter } = loadState();
      expect(letter.subject).toBe('My subject');
      expect(letter.body).toBe('');
      expect(letter.recipient).toEqual({ name: '', address: '' });
      expect(backups()).toEqual([raw]);
    });

    it('restores missing blocks and drops broken list items', () => {
      savedWith((l) => {
        l.blocks = { invitation: { agenda: [null, { text: 'Kept' }, 'junk', ['nested']] } };
      });
      const { letter } = loadState();
      expect(letter.blocks.invitation.agenda).toEqual([{ text: 'Kept' }]);
      expect(letter.blocks.request.items).toEqual([]);
      expect(letter.blocks.assignment.assignees).toEqual([{ name: '', idNumber: '', position: '' }]);
    });

    it('keeps 1 to 3 signatories', () => {
      savedWith((l) => { l.signatories = Array(5).fill({ roleHeader: '', name: 'A', roleTitle: '' }); });
      expect(loadState().letter.signatories).toHaveLength(3);
      savedWith((l) => { l.signatories = []; });
      expect(loadState().letter.signatories).toEqual([{ roleHeader: '', name: '', roleTitle: '' }]);
    });

    it('drops a logo that is not an image data URL', () => {
      savedWith((l) => { (l.letterhead as Record<string, unknown>).logoDataUrl = 'javascript:alert(1)'; });
      expect(loadState().letter.letterhead.logoDataUrl).toBeNull();
      savedWith((l) => { (l.letterhead as Record<string, unknown>).logoDataUrl = 'data:image/png;base64,AAAA'; });
      expect(loadState().letter.letterhead.logoDataUrl).toBe('data:image/png;base64,AAAA');
    });
  });

  it('reports failure instead of throwing when storage is full', () => {
    vi.stubGlobal('localStorage', {
      ...memoryStorage(),
      setItem: () => { throw new DOMException('quota', 'QuotaExceededError'); },
    });
    expect(saveState(freshState('en'))).toBe(false);
  });
});
