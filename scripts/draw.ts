import { randomInt } from 'node:crypto';
import { existsSync } from 'node:fs';
import { heroes } from '../src/data/heroes';

const destination = new URL('../src/data/assignments.json', import.meta.url);
if (existsSync(destination) && !process.argv.includes('--force')) {
  console.log('Przydział już istnieje. Zachowuję go. Nowe losowanie: bun run draw --force');
  process.exit(0);
}
const shuffled = heroes.map(hero => hero.id);
for (let index = shuffled.length - 1; index > 0; index--) {
  const target = randomInt(index + 1);
  [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
}
const players = ['Jędrzej', 'Piotr', 'Michał', 'Miłosz'].map((name, index) => ({
  id: ['jedrzej', 'piotr', 'michal', 'milosz'][index], name,
  heroes: shuffled.filter((_, heroIndex) => heroIndex % 4 === index),
}));
await Bun.write(destination, JSON.stringify({ drawnAt: new Date().toISOString(), players }, null, 2) + '\n');
console.log('Zapisano jednorazowe losowanie: 5 / 4 / 4 / 4 bohaterów.');
