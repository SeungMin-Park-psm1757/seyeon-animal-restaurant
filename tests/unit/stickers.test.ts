import { afterEach, describe, expect, it } from 'vitest';
import { giveSticker, readStickerBook, STICKER_KEY, STICKERS } from '../../src/game/stickers';

function storage(initial: Record<string, string> = {}, fail = false) {
  const values = new Map(Object.entries(initial));
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => { if (fail) throw new Error('blocked'); return values.get(key) ?? null; },
    setItem: (key: string, value: string) => { if (fail) throw new Error('blocked'); values.set(key, value); }
  } });
  return values;
}

afterEach(() => { delete (globalThis as { localStorage?: unknown }).localStorage; });

describe('gift sticker collection', () => {
  it('adds each free sticker once, then gives positive duplicates', () => {
    const values = storage();
    for (const item of STICKERS) expect(giveSticker()).toMatchObject({ sticker: item.id, isNew: true });
    expect(giveSticker()).toMatchObject({ sticker: 'rabbit', isNew: false });
    expect(JSON.parse(values.get(STICKER_KEY)!)).toMatchObject({ ids: STICKERS.map(x => x.id), gifts: 7 });
  });
  it('safely recovers corrupt data and continues when storage is blocked', () => {
    storage({ [STICKER_KEY]: '{bad' });
    expect(readStickerBook()).toEqual({ ids: [], gifts: 0 });
    storage({}, true);
    expect(readStickerBook()).toEqual({ ids: [], gifts: 0 });
    expect(giveSticker()).toMatchObject({ sticker: 'rabbit', isNew: true });
  });
  it('filters unknown and duplicate saved identifiers', () => {
    storage({ [STICKER_KEY]: JSON.stringify({ ids: ['rabbit', 'rabbit', 'bogus'], gifts: -1 }) });
    expect(readStickerBook()).toEqual({ ids: ['rabbit'], gifts: 1 });
  });
});
