import assert from 'assert';
import { generateMockData } from '../scrapers/mock-fetcher.js';

const data = generateMockData();
assert.ok(Array.isArray(data));
assert.ok(data.length >= 6);
console.log('Fetcher test passed successfully!');
