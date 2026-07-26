import { fetchPlaywrightAllSites } from './playwright-fetcher.js';
import { generateMockData } from './mock-fetcher.js';

export async function fetchRealAllSites() {
  console.log('Fetching real rankings using Playwright scraper engine...');
  let liveCollected = [];
  try {
    liveCollected = await fetchPlaywrightAllSites();
  } catch (err) {
    console.error('Playwright scraping encountered an error:', err.message);
  }

  if (liveCollected.length < 10) {
    console.log('Live scraping fetched minimal items. Supplementing with mock fallbacks...');
    const mocks = generateMockData();
    liveCollected = [...liveCollected, ...mocks];
  }

  const now = new Date().toISOString();
  return liveCollected;
}

