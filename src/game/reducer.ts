import { ANIMALS, ROUNDS, type FoodId } from './data';

export type Phase = 'welcome' | 'ready' | 'dragging' | 'feeding' | 'celebrating' | 'transitioning' | 'finished';
export type State = {
  phase: Phase; roundIndex: number; progressFlowers: number;
  selectedFoodId: FoodId | null; mistakesInRound: number; idleHint: boolean;
};
export type Action =
  | { type: 'start' | 'drag' | 'cancel' | 'idle' | 'chewed' | 'next' | 'arrived' | 'restart' }
  | { type: 'choose'; food: FoodId };
export const initialState: State = {
  phase: 'welcome', roundIndex: 0, progressFlowers: 0,
  selectedFoodId: null, mistakesInRound: 0, idleHint: false
};
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start': return state.phase === 'welcome' ? { ...initialState, phase: 'ready' } : state;
    case 'restart': return state.phase === 'finished' ? { ...initialState, phase: 'ready' } : state;
    case 'drag': return state.phase === 'ready' ? { ...state, phase: 'dragging', idleHint: false } : state;
    case 'cancel': return state.phase === 'dragging' ? { ...state, phase: 'ready' } : state;
    case 'idle': return state.phase === 'ready' ? { ...state, idleHint: true } : state;
    case 'choose': {
      if (state.phase !== 'ready' && state.phase !== 'dragging') return state;
      if (ANIMALS[ROUNDS[state.roundIndex]].food !== action.food) {
        return { ...state, phase: 'ready', mistakesInRound: state.mistakesInRound + 1, idleHint: false };
      }
      return { ...state, phase: 'feeding', selectedFoodId: action.food, idleHint: false, progressFlowers: state.progressFlowers + 1 };
    }
    case 'chewed': return state.phase === 'feeding' ? { ...state, phase: 'celebrating' } : state;
    case 'next': {
      if (state.phase !== 'celebrating') return state;
      if (state.roundIndex === ROUNDS.length - 1) return { ...state, phase: 'finished' };
      return { ...state, phase: 'transitioning', roundIndex: state.roundIndex + 1, mistakesInRound: 0, idleHint: false, selectedFoodId: null };
    }
    case 'arrived': return state.phase === 'transitioning' ? { ...state, phase: 'ready' } : state;
  }
}
