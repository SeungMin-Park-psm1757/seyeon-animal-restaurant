import { PLAY_BY_ID, type PlayState } from '../game/playEvents';

export function PlayEvent({ state, onTap, onClose }: {
  state: PlayState;
  onTap: () => void;
  onClose: () => void;
}) {
  if (state.mode === 'idle' || !state.id) return null;
  const game = PLAY_BY_ID[state.id];
  return <div className={`mini-event mini-event-${state.id} mini-mode-${state.mode}`} data-play-event={state.id} data-play-mode={state.mode}>
    <div className="mini-caption" aria-live="polite">
      <strong>{state.mode === 'reward' ? '우와! 최고야!' : game.prompt}</strong>
      {state.mode === 'active' && <span aria-label={`${state.steps}번 완료, 목표 ${game.taps}번`}>{Array.from({ length: game.taps }, (_, i) => <i key={i} className={i < state.steps ? 'done' : ''}>✿</i>)}</span>}
    </div>
    <button className="mini-close" type="button" aria-label="놀이 그만하고 밥 주기" onClick={onClose}>✕</button>
    {state.mode === 'active' && (
      state.id === 'bubbles'
        ? <div className="mini-bubbles">{Array.from({ length: game.taps - state.steps }, (_, i) =>
          <button type="button" className={`mini-bubble bubble-${i}`} key={i} aria-label="비눗방울 터뜨리기" onClick={onTap}>✦</button>)}</div>
        : <button type="button" className={`mini-target target-${state.id}`} aria-label={game.button} onClick={onTap}>
          <span aria-hidden="true">{game.icon}</span>
          <strong>{state.id === 'peek' ? '까꿍!' : state.id === 'pet' ? '쓰담쓰담' : state.id === 'hop' ? '폴짝!' : state.id === 'clap' ? '짝짝!' : '데굴!'}</strong>
        </button>
    )}
    {state.mode === 'reward' && <div className="mini-reward" role="status" aria-label={`${game.title} 완료`}>
      <span aria-hidden="true">💛 ✨ 🌸</span><strong>야호!</strong>
    </div>}
  </div>;
}
