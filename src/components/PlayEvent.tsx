import { PLAY_BY_ID, type PlayState } from '../game/playEvents';
import { useEffect, useState, type CSSProperties } from 'react';
import { BubbleArt, PeekGarden, PlayArt } from '../assets/play';
import { MusicMark } from './Decor';
import { StickerArt } from './StickerBook';
import type { StickerGift } from '../game/stickers';

function BalloonArt({ color }: { color: number }) {
  const colors = [['#f3c2cf', '#d99daa'], ['#c4dfe8', '#8fb8c6'], ['#c3dbb4', '#91b58c']][color];
  return <svg className="balloon-art" viewBox="0 0 100 120" aria-hidden="true" fill="none" stroke={colors[1]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M50 72c0 18 7 26 0 41m0-41-5 6 5 4 5-4Z" fill={colors[0]} /><path d="M50 70C30 55 17 40 22 23 29 2 71 2 78 23c5 17-8 32-28 47Z" fill={colors[0]} /><path d="M32 22c3-8 9-10 15-10" stroke="#fffdf7" strokeWidth="5" /></svg>;
}

function BlanketArt() {
  return <svg className="blanket-art" viewBox="0 0 320 128" aria-hidden="true" fill="none" stroke="#8fb4ad" strokeWidth="3" strokeLinejoin="round"><path d="M18 44c25-26 46-18 67-11 25-25 45-21 67-8 23-17 42-15 62 2 27-17 53-7 88 15v61H18Z" fill="#d6ece3" /><path d="M30 63c27-18 45-12 62-4m26-19c18-9 33-7 47 3m18 8c20-12 41-11 63 2m-60 50V69m-48 37V65m105 41V64" stroke="#b3d4cb" /><path d="m155 77 5 5 5-5" stroke="#d299a9" strokeLinecap="round" /></svg>;
}

function OpenGiftArt() {
  return <svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="#bd8491" strokeWidth="2.5" strokeLinejoin="round"><path d="M9 32h46v25H9z" fill="#efb8c5"/><path d="M8 27h48v10H8z" fill="#f4ccd4"/><path d="M32 27v30M31 26c-17-1-19-15-10-15 7 0 10 15 10 15Zm2 0c17-1 19-15 10-15-7 0-10 15-10 15Z" fill="#f5d987"/><path d="m11 15 3-5m36 6 4-5M30 7l2-5" stroke="#d3ad65" strokeLinecap="round"/></svg>;
}

export function PlayEvent({ state, onTap, onClose, onAlbum, gift }: {
  state: PlayState;
  onTap: () => void;
  onClose: () => void;
  onAlbum: () => void;
  gift: StickerGift | null;
}) {
  const [popped, setPopped] = useState<number[]>([]);
  const [burst, setBurst] = useState({ x: 50, y: 65 });
  useEffect(() => { if (state.mode === 'idle') setPopped([]); }, [state.mode]);
  if (state.mode === 'idle' || !state.id) return null;
  const game = PLAY_BY_ID[state.id];
  function reactAt(button: HTMLButtonElement, bubble?: number) {
    const area = button.closest('.mini-event')!.getBoundingClientRect();
    const bounds = button.getBoundingClientRect();
    setBurst({ x: (bounds.left + bounds.width / 2 - area.left) / area.width * 100, y: (bounds.top + bounds.height / 2 - area.top) / area.height * 100 });
    if (bubble !== undefined) setPopped(previous => [...previous, bubble]);
    onTap();
  }
  return <div className={`mini-event mini-event-${state.id} mini-mode-${state.mode}`} data-play-event={state.id} data-play-mode={state.mode} data-play-step={state.steps}>
    <div className="mini-caption" aria-live="polite">
      <PlayArt id={state.id} />
      <strong>{state.mode === 'reward' ? '우와! 최고야!' : game.prompt}</strong>
      {state.mode === 'active' && <span aria-label={`${state.steps}번 완료, 목표 ${game.taps}번`}>{Array.from({ length: game.taps }, (_, i) => <i key={i} className={i < state.steps ? 'done' : ''}>✿</i>)}</span>}
    </div>
    <button className="mini-close" type="button" aria-label="놀이 그만하고 밥 주기" onClick={onClose}>✕</button>
    {state.mode === 'active' && (
      state.id === 'bubbles'
        ? <div className="mini-bubbles">{Array.from({ length: game.taps }, (_, i) => !popped.includes(i) &&
          <button type="button" className={`mini-bubble bubble-${i}`} key={i} aria-label="비눗방울 터뜨리기" onClick={event => reactAt(event.currentTarget, i)}><BubbleArt /></button>)}</div>
        : state.id === 'balloons' ? <div className="mini-balloons">{[0, 1, 2].map(i => !popped.includes(i) && <button type="button" key={i} className={`mini-balloon balloon-slot-${i}`} aria-label={`풍선 ${i + 1} 띄우기`} onClick={event => reactAt(event.currentTarget, i)}><BalloonArt color={i} /></button>)}</div>
        : state.id === 'wash' ? null
        : state.id === 'peek' ? null
        : <button type="button" className={`mini-target target-${state.id}`} aria-label={game.button} onClick={event => reactAt(event.currentTarget)}>
          <PlayArt id={state.id} />
          {state.id === 'bedtime' ? <><BlanketArt /><strong>{state.steps === 0 ? '이불 덮기' : '기지개 켜기'}</strong></> : <strong>{state.id === 'pet' ? '쓰담쓰담' : state.id === 'hop' ? '폴짝!' : state.id === 'clap' ? '짝짝!' : state.id === 'gift' ? (state.steps === 0 ? '톡!' : '열어 봐!') : '데굴!'}</strong>}
        </button>
    )}
    {state.id === 'peek' && <button type="button" className="mini-target target-peek" aria-label={game.button} disabled={state.mode !== 'active'} onClick={event => reactAt(event.currentTarget)}>
      <PeekGarden /><strong>{state.mode === 'reward' ? '까꿍!' : '여기 숨어요'}</strong>
    </button>}
    {state.steps > 0 && <div key={state.steps} className={`play-burst burst-${state.id}`} aria-hidden="true" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
      {Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--dx': `${Math.cos(i * Math.PI * 2 / 7) * 65}px`, '--dy': `${Math.sin(i * Math.PI * 2 / 7) * 52 - 16}px`, '--turn': `${i * 51}deg` } as CSSProperties}>{game.id === 'clap' ? <MusicMark muted={false} /> : <PlayArt id={game.id === 'bubbles' ? 'peek' : game.id} />}</i>)}
    </div>}
    {state.mode === 'reward' && <div className="mini-reward" role="status" aria-label={`${game.title} 완료`}>
      {state.id === 'gift' && gift ? <div className="gift-reward"><OpenGiftArt /><StickerArt id={gift.sticker} /><strong>{gift.isNew ? '새 스티커야!' : '또 만나 반가워!'}</strong><button type="button" onClick={onAlbum}>앨범 보기</button></div> : <><span aria-hidden="true"><PlayArt id="pet" /><PlayArt id="peek" /><PlayArt id="pet" /></span><strong>{state.id === 'peek' ? '까꿍!' : state.id === 'wash' ? '반짝반짝 깨끗해!' : state.id === 'bedtime' ? '잘 자고 일어났어요!' : state.id === 'balloons' ? '손 흔들며 안녕!' : '야호!'}</strong></>}
    </div>}
  </div>;
}
