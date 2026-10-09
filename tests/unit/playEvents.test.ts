import { describe, expect, it } from 'vitest';
import { PLAY_BY_ID, PLAY_EVENTS, initialPlayState, playReducer, selectPlay } from '../../src/game/playEvents';
import { MOTIONS, nextIdleMotion } from '../../src/game/idleMotions';

describe('animal village event engine', () => {
  it('has ten distinct playable games and valid goals', () => {
    expect(new Set(PLAY_EVENTS.map(x => x.id)).size).toBe(10);
    expect(PLAY_EVENTS.every(x => x.taps >= 1 && x.taps <= 3)).toBe(true);
  });
  it('respects animal-specific games', () => {
    expect(selectPlay('rabbit', [], .26)).toBe('hop');
    expect(selectPlay('monkey', [], .26)).toBe('clap');
    expect(selectPlay('panda', [], .26)).toBe('roll');
    for (const animal of ['rabbit', 'monkey', 'panda'] as const) {
      for (let i = 0; i < 10; i++) {
        const event = PLAY_BY_ID[selectPlay(animal, [], i / 10)];
        expect(event.animals === undefined || event.animals.includes(animal)).toBe(true);
      }
    }
  });
  it('avoids the last two games and promotes unseen content', () => {
    expect(selectPlay('rabbit', ['bubbles', 'pet'], 0)).toBe('hop');
    expect(selectPlay('rabbit', ['bubbles', 'pet', 'hop'], .21)).toBe('wash');
    const history = ['bubbles', 'pet', 'hop', 'peek', 'wash', 'balloons', 'bedtime', 'gift'] as const;
    expect(selectPlay('rabbit', history, 0)).not.toBe('gift');
    expect(selectPlay('rabbit', history, .99)).not.toBe('bedtime');
  });
  it('requires the proper number of touches and rejects duplicate reward touches', () => {
    let state = playReducer(initialPlayState, { type: 'open', animal: 'rabbit', roll: .26 });
    expect(state).toMatchObject({ mode: 'active', id: 'hop', steps: 0 });
    expect(playReducer(state, { type: 'open', animal: 'panda', roll: 0 })).toBe(state);
    for (let i = 1; i <= 3; i++) {
      state = playReducer(state, { type: 'tap' });
      expect(state.steps).toBe(i);
    }
    expect(state.mode).toBe('reward');
    expect(state.history).toEqual(['hop']);
    expect(playReducer(state, { type: 'tap' })).toBe(state);
    state = playReducer(state, { type: 'close' });
    expect(state).toMatchObject({ mode: 'idle', steps: 0 });
    expect(state.history).toEqual(['hop']);
  });
  it('allows cancellation without a reward and reset without stale data', () => {
    let state = playReducer(initialPlayState, { type: 'open', animal: 'panda', roll: .26 });
    expect(state.id).toBe('roll');
    state = playReducer(state, { type: 'tap' });
    state = playReducer(state, { type: 'close' });
    expect(state.history).toEqual([]);
    expect(playReducer(state, { type: 'tap' })).toBe(state);
    expect(playReducer(state, { type: 'reset' })).toEqual(initialPlayState);
  });
  it('clamps invalid random input and keeps deterministic selection', () => {
    expect(selectPlay('rabbit', [], NaN)).toBe('bubbles');
    expect(selectPlay('rabbit', [], 100)).toBe('gift');
    expect(selectPlay('rabbit', [], -100)).toBe('bubbles');
  });
});

describe('idle characters', () => {
  it('has three distinct character motions per animal', () => {
    expect(Object.values(MOTIONS).every(x => x.length === 3 && new Set(x).size === 3)).toBe(true);
  });
  it('does not pick the previous motion twice', () => {
    for (const animal of ['rabbit', 'monkey', 'panda'] as const) {
      const last = MOTIONS[animal][0];
      for (const roll of [0, .3, .5, .99999]) expect(nextIdleMotion(animal, last, roll)).not.toBe(last);
    }
  });
});
