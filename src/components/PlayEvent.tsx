import { PLAY_BY_ID, type PlayState } from '../game/playEvents';
import { useEffect, useState, type CSSProperties } from 'react';
import { BubbleArt, PeekGarden, PlayArt } from '../assets/play';
import { MusicMark } from './Decor';

export function PlayEvent({ state, onTap, onClose }: {
  state: PlayState;
  onTap: () => void;
  onClose: () => void;
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
  return <div className={`mini-event mini-event-${state.id} mini-mode-${state.mode}`} data-play-event={state.id} data-play-mode={state.mode}>
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
        : state.id !== 'peek' && <button type="button" className={`mini-target target-${state.id}`} aria-label={game.button} onClick={event => reactAt(event.currentTarget)}>
          <PlayArt id={state.id} />
          <strong>{state.id === 'pet' ? '쓰담쓰담' : state.id === 'hop' ? '폴짝!' : state.id === 'clap' ? '짝짝!' : '데굴!'}</strong>
        </button>
    )}
    {state.id === 'peek' && <button type="button" className="mini-target target-peek" aria-label={game.button} disabled={state.mode !== 'active'} onClick={event => reactAt(event.currentTarget)}>
      <PeekGarden /><strong>{state.mode === 'reward' ? '까꿍!' : '여기 숨어요'}</strong>
    </button>}
    {state.steps > 0 && <div key={state.steps} className={`play-burst burst-${state.id}`} aria-hidden="true" style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>
      {Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--dx': `${Math.cos(i * Math.PI * 2 / 7) * 65}px`, '--dy': `${Math.sin(i * Math.PI * 2 / 7) * 52 - 16}px`, '--turn': `${i * 51}deg` } as CSSProperties}>{game.id === 'clap' ? <MusicMark muted={false} /> : <PlayArt id={game.id === 'bubbles' ? 'peek' : game.id} />}</i>)}
    </div>}
    {state.mode === 'reward' && <div className="mini-reward" role="status" aria-label={`${game.title} 완료`}>
      <span aria-hidden="true"><PlayArt id="pet" /><PlayArt id="peek" /><PlayArt id="pet" /></span><strong>{state.id === 'peek' ? '까꿍!' : '야호!'}</strong>
    </div>}
  </div>;
}
