import { describe, expect, it, vi, afterEach } from 'vitest';
import { ANIMALS, FOODS, ROUNDS, inside, makeLayouts } from '../../src/game/data';
import { initialState, reducer } from '../../src/game/reducer';
import { readMuted, saveMuted, sound, unlockAudio } from '../../src/audio/audioEngine';

afterEach(() => vi.unstubAllGlobals());
describe('six gentle rounds', () => {
  it('uses the specified order and food mapping', () => {
    expect(ROUNDS).toEqual(['rabbit', 'monkey', 'panda', 'rabbit', 'monkey', 'panda']);
    expect(ROUNDS.map(id => ANIMALS[id].food)).toEqual(['carrot', 'banana', 'bamboo', 'carrot', 'banana', 'bamboo']);
  });
  it('has exactly three unique foods and never repeats the correct slot three times', () => {
    for (const random of [() => 0, () => .9999, Math.random]) {
      for (let run = 0; run < 50; run++) {
        const layouts = makeLayouts(random);
        const slots = layouts.map((foods, i) => {
          expect([...foods].sort()).toEqual([...FOODS].sort());
          return foods.indexOf(ANIMALS[ROUNDS[i]].food);
        });
        slots.slice(2).forEach((slot, i) => expect(slots[i] === slot && slots[i + 1] === slot).toBe(false));
      }
    }
  });
  it('ignores wrong food, then resets two-mistake hint after success', () => {
    let state = reducer(initialState, { type: 'start' });
    state = reducer(state, { type: 'choose', food: 'banana' });
    state = reducer(state, { type: 'choose', food: 'bamboo' });
    expect(state).toMatchObject({ phase: 'ready', roundIndex: 0, progressFlowers: 0, mistakesInRound: 2 });
    state = reducer(state, { type: 'choose', food: 'carrot' });
    state = reducer(state, { type: 'chewed' });
    state = reducer(state, { type: 'next' });
    expect(state).toMatchObject({ roundIndex: 1, mistakesInRound: 0, idleHint: false, selectedFoodId: null });
  });
  it('serializes rapid duplicate feed/chew/next events and completes exactly six flowers', () => {
    let state = reducer(initialState, { type: 'start' });
    for (let i = 0; i < 6; i++) {
      const action = { type: 'choose', food: ANIMALS[ROUNDS[i]].food } as const;
      state = reducer(state, action);
      expect(reducer(state, action)).toBe(state);
      expect(state.progressFlowers).toBe(i + 1);
      state = reducer(state, { type: 'chewed' });
      expect(reducer(state, { type: 'chewed' })).toBe(state);
      state = reducer(state, { type: 'next' });
      expect(reducer(state, { type: 'next' })).toBe(state);
      if (i < 5) state = reducer(state, { type: 'arrived' });
    }
    expect(state).toMatchObject({ phase: 'finished', progressFlowers: 6, roundIndex: 5 });
    expect(reducer(state, { type: 'choose', food: 'bamboo' })).toBe(state);
    expect(reducer(state, { type: 'restart' })).toEqual({ ...initialState, phase: 'ready' });
  });
  it('cancels drag safely and does not let stale actions escape their phases', () => {
    let state = reducer(initialState, { type: 'start' });
    state = reducer(state, { type: 'drag' });
    expect(state.phase).toBe('dragging');
    expect(reducer(state, { type: 'idle' })).toBe(state);
    state = reducer(state, { type: 'cancel' });
    expect(state).toMatchObject({ phase: 'ready', progressFlowers: 0 });
    expect(reducer(state, { type: 'next' })).toBe(state);
    expect(reducer(state, { type: 'restart' })).toBe(state);
    state = reducer(state, { type: 'idle' });
    expect(state.idleHint).toBe(true);
    state = reducer(state, { type: 'choose', food: 'carrot' });
    expect(reducer(state, { type: 'cancel' })).toBe(state);
    expect(state.idleHint).toBe(false);
  });
  it('accepts inclusive drop-zone edges and rejects coordinates outside', () => {
    const rect = { left: 10, right: 130, top: 20, bottom: 140 };
    expect(inside(10, 20, rect)).toBe(true);
    expect(inside(130, 140, rect)).toBe(true);
    expect(inside(9, 20, rect)).toBe(false);
    expect(inside(130, 141, rect)).toBe(false);
  });
});
describe('optional local audio', () => {
  it('defaults to sound enabled when storage is available', () => {
    vi.stubGlobal('localStorage', { getItem: () => null }); expect(readMuted()).toBe(false);
  });
  it('restores mute and stores a toggle without other player data', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { getItem: () => 'true', setItem });
    expect(readMuted()).toBe(true); saveMuted(false);
    expect(setItem).toHaveBeenCalledExactlyOnceWith('seyeon-restaurant-muted', 'false');
  });
  it('stays safe and muted when storage access is denied', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw Error('denied'); }, setItem: () => { throw Error('denied'); } });
    expect(readMuted()).toBe(true); expect(() => saveMuted(false)).not.toThrow();
  });
  it('audio unavailability cannot interrupt play', () => {
    vi.stubGlobal('AudioContext', class { constructor() { throw Error('unsupported'); } });
    expect(() => { unlockAudio(); sound('finish', false); }).not.toThrow();
  });
});
