export const STICKERS = [
  { id: 'rabbit', name: '토토' }, { id: 'monkey', name: '몽몽' }, { id: 'panda', name: '팡팡' },
  { id: 'flower', name: '꽃송이' }, { id: 'star', name: '반짝별' }, { id: 'heart', name: '다정한 하트' }
] as const;
export type StickerId = typeof STICKERS[number]['id'];
export const STICKER_KEY = 'seyeon-animal-village-stickers-v1';
export type StickerBook = { ids: StickerId[]; gifts: number };
export type StickerGift = { sticker: StickerId; isNew: boolean; book: StickerBook };

export function readStickerBook(): StickerBook {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(STICKER_KEY) ?? 'null');
    if (!data || typeof data !== 'object') return { ids: [], gifts: 0 };
    const saved = data as { ids?: unknown; gifts?: unknown };
    const ids = Array.isArray(saved.ids) ? [...new Set(saved.ids.filter((id): id is StickerId => STICKERS.some(item => item.id === id)))] : [];
    const gifts = Number.isSafeInteger(saved.gifts) && (saved.gifts as number) >= 0 ? saved.gifts as number : ids.length;
    return { ids, gifts };
  } catch { return { ids: [], gifts: 0 }; }
}

export function giveSticker(): StickerGift {
  const book = readStickerBook();
  const next = STICKERS.find(item => !book.ids.includes(item.id))?.id;
  const sticker = next ?? STICKERS[book.gifts % STICKERS.length].id;
  const isNew = !book.ids.includes(sticker);
  const updated = { ids: isNew ? [...book.ids, sticker] : book.ids, gifts: book.gifts + 1 };
  try { localStorage.setItem(STICKER_KEY, JSON.stringify(updated)); } catch { /* The gift remains playable when browser storage is unavailable. */ }
  return { sticker, isNew, book: updated };
}
