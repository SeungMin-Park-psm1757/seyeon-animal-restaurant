export const FOODS = ['carrot', 'banana', 'bamboo'] as const;
export type FoodId = typeof FOODS[number];
export const ANIMALS = {
  rabbit: { name: '토토', species: '토끼', food: 'carrot', color: '#ffe0e8' },
  monkey: { name: '몽몽', species: '원숭이', food: 'banana', color: '#eee6ff' },
  panda: { name: '팡팡', species: '판다', food: 'bamboo', color: '#dbf4e9' }
} as const;
export type AnimalId = keyof typeof ANIMALS;
export const FOOD_NAMES: Record<FoodId, string> = { carrot: '당근', banana: '바나나', bamboo: '대나무' };
export const ROUNDS: readonly AnimalId[] = ['rabbit', 'monkey', 'panda', 'rabbit', 'monkey', 'panda'];
export const DRAG_THRESHOLD = 12;
export const PHASE_MS = { feeding: 920, celebrating: 950, transitioning: 280 } as const;

export function makeLayouts(random: () => number = Math.random): FoodId[][] {
  const positions: number[] = [];
  return ROUNDS.map((id, index) => {
    let options = [0, 1, 2];
    if (index >= 2 && positions[index - 1] === positions[index - 2]) {
      options = options.filter(position => position !== positions[index - 1]);
    }
    const position = options[Math.floor(random() * options.length)];
    positions.push(position);
    const others = FOODS.filter(food => food !== ANIMALS[id].food);
    if (random() < .5) others.reverse();
    const row = [...others];
    row.splice(position, 0, ANIMALS[id].food);
    return row;
  });
}

export function inside(x: number, y: number, rect: { left: number; right: number; top: number; bottom: number }) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
