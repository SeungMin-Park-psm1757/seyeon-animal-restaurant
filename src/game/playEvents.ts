import type { AnimalId } from './data';

export type PlayId = 'bubbles' | 'pet' | 'hop' | 'clap' | 'roll' | 'peek';
export type PlayMode = 'idle' | 'active' | 'reward';

export type PlayDefinition = {
  id: PlayId;
  title: string;
  prompt: string;
  icon: string;
  button: string;
  taps: number;
  animals?: readonly AnimalId[];
};

export const PLAY_EVENTS: readonly PlayDefinition[] = [
  { id: 'bubbles', title: '비눗방울 팡팡', prompt: '방울을 톡톡!', icon: '🫧', button: '방울 터뜨리기', taps: 3 },
  { id: 'pet', title: '사랑해 쓰담쓰담', prompt: '친구를 쓰담쓰담!', icon: '🩷', button: '쓰다듬기', taps: 3 },
  { id: 'hop', title: '토토 폴짝폴짝', prompt: '토토와 폴짝!', icon: '🐰', button: '폴짝 뛰기', taps: 3, animals: ['rabbit'] },
  { id: 'clap', title: '몽몽 짝짝 음악회', prompt: '짝짝! 함께 박수!', icon: '👏', button: '짝짝 박수', taps: 3, animals: ['monkey'] },
  { id: 'roll', title: '팡팡 데굴데굴', prompt: '팡팡 데굴데굴!', icon: '🐼', button: '데굴데굴', taps: 2, animals: ['panda'] },
  { id: 'peek', title: '꼭꼭 숨어라', prompt: '꽃을 눌러 까꿍!', icon: '🌼', button: '꽃 뒤의 친구 찾기', taps: 1 }
];
export const PLAY_BY_ID = Object.fromEntries(PLAY_EVENTS.map(event => [event.id, event])) as Record<PlayId, PlayDefinition>;

export type PlayState = { mode: PlayMode; id: PlayId | null; steps: number; history: PlayId[] };
export const initialPlayState: PlayState = { mode: 'idle', id: null, steps: 0, history: [] };
export type PlayAction =
  | { type: 'open'; animal: AnimalId; roll: number }
  | { type: 'tap' }
  | { type: 'close' }
  | { type: 'reset' };

/** Pure selection: prefer unseen games, avoid the last two when alternatives exist. */
export function selectPlay(animal: AnimalId, history: readonly PlayId[], roll: number): PlayId {
  const valid = PLAY_EVENTS.filter(event => !event.animals || event.animals.includes(animal));
  const notRecent = valid.filter(event => !history.slice(-2).includes(event.id));
  const candidates = notRecent.length ? notRecent : valid;
  const unseen = candidates.filter(event => !history.includes(event.id));
  const choices = unseen.length ? unseen : candidates;
  const number = Number.isFinite(roll) ? Math.min(Math.max(roll, 0), 0.999999) : 0;
  return choices[Math.floor(number * choices.length)].id;
}

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case 'open': {
      if (state.mode !== 'idle') return state;
      return { ...state, mode: 'active', id: selectPlay(action.animal, state.history, action.roll), steps: 0 };
    }
    case 'tap': {
      if (state.mode !== 'active' || !state.id) return state;
      const steps = state.steps + 1;
      if (steps < PLAY_BY_ID[state.id].taps) return { ...state, steps };
      return { mode: 'reward', id: state.id, steps, history: [...state.history.slice(-11), state.id] };
    }
    case 'close': return state.mode === 'idle' ? state : { ...state, mode: 'idle', id: null, steps: 0 };
    case 'reset': return { ...initialPlayState };
  }
}
