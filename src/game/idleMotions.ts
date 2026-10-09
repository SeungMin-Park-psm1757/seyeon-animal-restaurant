import type { AnimalId } from './data';

export type IdleMotion = 'sniff' | 'ears' | 'tilt' | 'wave' | 'cheeks' | 'tail' | 'yawn' | 'belly' | 'sway';
export const MOTIONS: Record<AnimalId, readonly IdleMotion[]> = {
  rabbit: ['sniff', 'ears', 'tilt'],
  monkey: ['wave', 'cheeks', 'tail'],
  panda: ['yawn', 'belly', 'sway']
};

/** Avoid replaying the same idle animation consecutively. */
export function nextIdleMotion(animal: AnimalId, previous: IdleMotion | null, roll: number): IdleMotion {
  const options = MOTIONS[animal].filter(motion => motion !== previous);
  const n = Number.isFinite(roll) ? Math.min(Math.max(roll, 0), .999999) : 0;
  return options[Math.floor(n * options.length)];
}
