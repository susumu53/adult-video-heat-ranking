import fs from 'fs';
import path from 'path';
import { generateMockData } from './scrapers/mock-fetcher.js';

const items = generateMockData();
const payload = {
  updated_at: new Date().toISOString(),
  items: items.sort((a, b) => b.heat_score - a.heat_score)
};

const targets = [
  path.resolve('data/rankings.json'),
  path.resolve('public/data/rankings.json')
];

if (fs.existsSync(path.resolve('dist'))) {
  targets.push(path.resolve('dist/data/rankings.json'));
}

targets.forEach(outPath => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
});

console.log(`Saved ${items.length} items to ${targets.length} output paths.`);
