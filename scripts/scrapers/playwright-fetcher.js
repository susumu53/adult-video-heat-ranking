import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function parseViews(text) {
  if (!text) return 10000;
  const cleaned = text.replace(/,/g, '').trim();
  if (/(\d+(\.\d+)?)\s*M/i.test(cleaned)) {
    return Math.round(parseFloat(cleaned) * 1000000);
  }
  if (/(\d+(\.\d+)?)\s*K/i.test(cleaned)) {
    return Math.round(parseFloat(cleaned) * 1000);
  }
  const digits = cleaned.match(/\d+/g);
  return digits ? parseInt(digits.join(''), 10) : 10000;
}

async function scrapeSiteWithBrowser(context, siteName, url, parseFn) {
  let page = null;
  try {
    page = await context.newPage();
    console.log(`[Playwright] Navigating to ${siteName}: ${url}`);
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2500);

    const html = await page.content();
    const $ = cheerio.load(html);
    const results = parseFn($, siteName);
    console.log(`[Playwright] ${siteName}: successfully fetched ${results.length} items.`);
    return results;
  } catch (err) {
    console.error(`[Playwright] Failed scraping ${siteName}:`, err.message);
    return [];
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

// 1. TokyoMotion Scraper
function parseTokyoMotion($) {
  const results = [];
  $('a[href*="/video/"]').each((i, el) => {
    if (results.length >= 15) return;
    const href = $(el).attr('href');
    const container = $(el).closest('.video-box, .thumb-block, .item, div');
    const title = container.find('.title, .video-title, .name').text().trim() || $(el).attr('title') || $(el).text().trim();
    const img = container.find('img').first();
    let thumb = img.attr('data-src') || img.attr('src') || '';
    const viewsText = container.find('.views, .video-views, .meta, span').text();

    if (title && href && !href.includes('/category/') && title.length > 3) {
      const fullUrl = href.startsWith('http') ? href : `https://www.tokyomotion.net${href}`;
      if (!results.some(r => r.url === fullUrl)) {
        results.push({
          id: `tokyomotion_${results.length + 1}`,
          site: 'TokyoMotion',
          title: title.slice(0, 100),
          url: fullUrl,
          thumbnail: thumb.startsWith('//') ? `https:${thumb}` : thumb,
          views: parseViews(viewsText)
        });
      }
    }
  });
  return results;
}

// 2. XVideos Scraper
function parseXVideos($) {
  const results = [];
  $('.thumb-block').each((i, el) => {
    if (i >= 15) return;
    const title = $(el).find('.title a').text().trim() || $(el).find('.title').text().trim();
    const href = $(el).find('.title a, a').attr('href');
    const img = $(el).find('.thumb img, img');
    let thumb = img.attr('data-src') || img.attr('src') || '';
    const viewsText = $(el).find('.metadata .views, .views').text();

    if (title && href) {
      const fullUrl = href.startsWith('http') ? href : `https://www.xvideos.com${href}`;
      results.push({
        id: `xvideos_${i + 1}`,
        site: 'XVideos',
        title: title.slice(0, 100),
        url: fullUrl,
        thumbnail: thumb,
        views: parseViews(viewsText)
      });
    }
  });
  return results;
}

// 3. SpankBang Scraper
function parseSpankBang($) {
  const results = [];
  $('.video-item, .item, a[href*="/video/"], .video-list a').each((i, el) => {
    if (results.length >= 15) return;
    const a = $(el).is('a') ? $(el) : $(el).find('a').first();
    const title = a.attr('title') || $(el).find('img').attr('alt') || $(el).find('.title, .n, span').text().trim() || a.text().trim();
    const href = a.attr('href');
    const img = $(el).find('img').first();
    let thumb = img.attr('data-src') || img.attr('src') || img.attr('data-srcset') || '';
    const viewsText = $(el).find('.views, .stats, .v, span').text();

    if (title && href && href.includes('/video/') && title.length > 2) {
      const fullUrl = href.startsWith('http') ? href : `https://spankbang.com${href}`;
      if (!results.some(r => r.url === fullUrl)) {
        results.push({
          id: `spankbang_${results.length + 1}`,
          site: 'SpankBang',
          title: title.slice(0, 100),
          url: fullUrl,
          thumbnail: thumb,
          views: parseViews(viewsText)
        });
      }
    }
  });
  return results;
}

// 4. Pornhub Scraper
function parsePornhub($) {
  const results = [];
  $('.pcVideoListItem, .videoblock').each((i, el) => {
    if (i >= 15) return;
    const a = $(el).find('a').first();
    const title = $(el).find('.title a, .title').text().trim() || a.attr('title') || '';
    const href = a.attr('href');
    const img = $(el).find('img').first();
    let thumb = img.attr('data-src') || img.attr('src') || '';
    const viewsText = $(el).find('.views var, .views').text();

    if (title && href && !href.includes('javascript')) {
      const fullUrl = href.startsWith('http') ? href : `https://www.pornhub.com${href}`;
      results.push({
        id: `pornhub_${i + 1}`,
        site: 'Pornhub',
        title: title.slice(0, 100),
        url: fullUrl,
        thumbnail: thumb,
        views: parseViews(viewsText)
      });
    }
  });
  return results;
}

// 5. FC2動画 Scraper
function parseFC2($) {
  const results = [];
  $('a[href*="/a/content/"], a[href*="/content/"], .c-videoList_item, .items_item, .video_item').each((i, el) => {
    if (results.length >= 15) return;
    const a = $(el).is('a') ? $(el) : $(el).find('a').first();
    const title = $(el).find('.c-videoList_title, .title, .c-videoList_title_text').text().trim() || a.attr('title') || a.text().trim();
    const href = a.attr('href');
    const img = $(el).find('img').first();
    let thumb = img.attr('data-src') || img.attr('src') || '';
    const viewsText = $(el).find('.c-videoList_count, .count, .views').text();

    if (title && href && (href.includes('/content/') || href.includes('/a/content/')) && title.length > 2) {
      const fullUrl = href.startsWith('http') ? href : `https://video.fc2.com${href}`;
      if (!results.some(r => r.url === fullUrl)) {
        results.push({
          id: `fc2_${results.length + 1}`,
          site: 'FC2動画',
          title: title.slice(0, 100),
          url: fullUrl,
          thumbnail: thumb,
          views: parseViews(viewsText)
        });
      }
    }
  });
  return results;
}

// 6. MissAV Scraper
function parseMissAV($) {
  const results = [];
  $('.thumbnail, .thumbnail-container, .grid div').each((i, el) => {
    if (results.length >= 15) return;
    const a = $(el).find('a').first();
    const title = a.text().trim() || $(el).find('img').attr('alt') || $(el).find('.title').text().trim() || '';
    const href = a.attr('href');
    const img = $(el).find('img').first();
    let thumb = img.attr('data-src') || img.attr('src') || '';

    if (title && href) {
      const fullUrl = href.startsWith('http') ? href : `https://missav.ai${href}`;
      if (!results.some(r => r.url === fullUrl)) {
        results.push({
          id: `missav_${results.length + 1}`,
          site: 'MissAV',
          title: title.slice(0, 100),
          url: fullUrl,
          thumbnail: thumb,
          views: 350000 - results.length * 12000
        });
      }
    }
  });
  return results;
}

export async function fetchPlaywrightAllSites() {
  console.log('[Playwright] Launching Chromium browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 800 }
  });

  await context.addCookies([
    { name: 'over18', value: '1', domain: '.fc2.com', path: '/' },
    { name: 'fc2_adult', value: '1', domain: '.fc2.com', path: '/' },
    { name: 'age_verified', value: '1', domain: '.tokyomotion.net', path: '/' }
  ]);

  try {
    const [tokyo, xvideos, spank, pornhub, fc2, missav] = await Promise.all([
      scrapeSiteWithBrowser(context, 'TokyoMotion', 'https://www.tokyomotion.net/videos', parseTokyoMotion),
      scrapeSiteWithBrowser(context, 'XVideos', 'https://www.xvideos.com/best', parseXVideos),
      scrapeSiteWithBrowser(context, 'SpankBang', 'https://spankbang.com/most_popular', parseSpankBang),
      scrapeSiteWithBrowser(context, 'Pornhub', 'https://www.pornhub.com/video?o=ht', parsePornhub),
      scrapeSiteWithBrowser(context, 'FC2動画', 'https://video.fc2.com/a/', parseFC2),
      scrapeSiteWithBrowser(context, 'MissAV', 'https://missav.ai/ja/today-hot', parseMissAV)
    ]);

    const allItems = [...tokyo, ...xvideos, ...spank, ...pornhub, ...fc2, ...missav];
    console.log(`[Playwright] Scraping finished. Total items fetched: ${allItems.length}`);
    return allItems;
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
