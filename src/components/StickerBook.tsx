import { AnimalArt } from '../assets/characters';
import { STICKERS, type StickerId } from '../game/stickers';

export function StickerArt({ id }: { id: StickerId }) {
  if (id === 'rabbit' || id === 'monkey' || id === 'panda') return <AnimalArt id={id} mood="delighted" />;
  return <svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="#9a7880" strokeWidth="3" strokeLinejoin="round">
    {id === 'flower' ? <><path d="M50 54v34m0-12-16-9" stroke="#80a982" /><g fill="#f1bfd0"><circle cx="50" cy="29" r="16" /><circle cx="69" cy="43" r="16" /><circle cx="62" cy="64" r="16" /><circle cx="38" cy="64" r="16" /><circle cx="31" cy="43" r="16" /></g><circle cx="50" cy="47" r="11" fill="#f8d985" /></>
      : id === 'star' ? <path d="m50 9 12 27 29 3-22 19 7 29-26-16-26 16 7-29L9 39l29-3Z" fill="#f5d684" stroke="#d8b66f" />
      : <path d="M50 85 17 54C-4 29 24 9 50 33 76 9 104 29 83 54Z" fill="#efb6c4" stroke="#d89aaa" />}
  </svg>;
}

export function StickerBook({ ids, onClose }: { ids: readonly StickerId[]; onClose: () => void }) {
  return <section className="sticker-book" role="dialog" aria-modal="true" aria-label="스티커 앨범">
    <div className="sticker-book-panel">
      <header><div><strong>스티커 앨범</strong><span>{ids.length} / {STICKERS.length}개 모았어요</span></div><button type="button" aria-label="앨범 닫기" onClick={onClose}>×</button></header>
      <div className="sticker-grid">{STICKERS.map(item => <div className={`sticker-card ${ids.includes(item.id) ? 'collected' : ''}`} key={item.id}>
        {ids.includes(item.id) ? <StickerArt id={item.id} /> : <span className="sticker-empty" aria-hidden="true">✿</span>}
        <span>{ids.includes(item.id) ? item.name : '다음에 만나요'}</span>
      </div>)}</div>
    </div>
  </section>;
}

export function StickerButton({ count, onClick }: { count: number; onClick: () => void }) {
  return <button className="sticker-book-button" type="button" aria-label={`스티커 앨범, ${count}개`} title="스티커 앨범" onPointerDown={event => event.stopPropagation()} onClick={onClick}>
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#9a7880" strokeWidth="2.5" strokeLinejoin="round"><path d="M9 8h22l8 8v25H9z" fill="#fff6e6"/><path d="M31 8v9h8M16 28c5-7 11-7 16 0v7H16Z" fill="#f2bdcd"/><path d="M21 22v-3m7 3v-3" strokeLinecap="round"/></svg>
    <span>{count}</span>
  </button>;
}
