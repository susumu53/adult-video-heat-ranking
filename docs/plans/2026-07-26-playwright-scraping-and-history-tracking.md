# Playwright Web Scraping & History Tracking Engine Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement a reliable Playwright-based scraper for 6 adult video sites (bypassing Cloudflare/WAF) and calculate accurate Heat Scores using daily historical snapshots.

**Architecture:** Replace static `fetch` with Headless Chromium via Playwright. Store daily snapshots in `data/history/YYYY-MM-DD.json` and calculate real view deltas ($\Delta V_{24h}, \Delta V_{7d}$) to compute true Heat Scores for `data/rankings.json`. Update GitHub Actions workflow to run Playwright in CI.

**Tech Stack:** Node.js, Playwright, Cheerio, Vite, React, GitHub Actions

---

### Task 1: Install Playwright & Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install playwright package**
Run: `npm install -D playwright`
Expected: `playwright` added to `devDependencies` in `package.json`.

**Step 2: Install chromium browser binary**
Run: `npx playwright install chromium`
Expected: Chromium browser downloaded and ready.

**Step 3: Commit dependency changes**
Run: `git add package.json package-lock.json`
Run: `git commit -m "chore: install playwright dependency"`

---

### Task 2: Implement Playwright-based 6-Site Scraper Engine

**Files:**
- Create: [playwright-fetcher.js](file:///c:/Users/garoa/Desktop/antigravity/web%E3%82%B5%E3%82%A4%E3%83%88/scripts/scrapers/playwright-fetcher.js)
- Modify: [real-fetcher.js](file:///c:/Users/garoa/Desktop/antigravity/web%E3%82%B5%E3%82%A4%E3%83%88/scripts/scrapers/real-fetcher.js)

**Step 1: Write Playwright scraper for TokyoMotion, XVideos, SpankBang, Pornhub, FC2, MissAV**
Create `scripts/scrapers/playwright-fetcher.js` with stealth headers, `waitForSelector`, and Cheerio/DOM parsing for all 6 target sites.

**Step 2: Update `real-fetcher.js` to delegate to `playwright-fetcher.js`**
Modify `real-fetcher.js` to call `fetchPlaywrightAllSites()`.

**Step 3: Run standalone verification test**
Run: `node -e "import('./scripts/scrapers/real-fetcher.js').then(m => m.fetchRealAllSites().then(res => console.log('Fetched:', res.length, 'sites:', [...new Set(res.map(x=>x.site))])))"`
Expected: Output showing fetched items from all 6 target sites (or successfully scraped sites without fallback mocks).

**Step 4: Commit scraper changes**
Run: `git add scripts/scrapers/playwright-fetcher.js scripts/scrapers/real-fetcher.js`
Run: `git commit -m "feat: implement Playwright scraper for 6 target sites"`

---

### Task 3: Implement History Snapshot Storage & Real Delta Calculation

**Files:**
- Modify: [fetch-data.js](file:///c:/Users/garoa/Desktop/antigravity/web%E3%82%B5%E3%82%A4%E3%83%88/scripts/fetch-data.js)

**Step 1: Update `fetch-data.js` to save history snapshot & calculate real deltas**
- Save current fetch results to `data/history/YYYY-MM-DD.json`.
- Load previous day's snapshot `data/history/YYYY-MM-DD-1d.json` (or latest available snapshot).
- Match videos by `url` or `id` and calculate $\Delta V_{24h} = V_{\text{now}} - V_{\text{prev}}$.
- Calculate Heat Score: $\text{Math.min}(100, \text{Math.max}(50, \text{Math.round}(\Delta V_{24h} / (\log_{10}(V_{\text{base}} + 1000) \times 50))))$.

**Step 2: Verify `npm run fetch-data` execution**
Run: `npm run fetch-data`
Expected: `Saved items to output paths.` with snapshot created in `data/history/` and valid `daily_delta` and `heat_score` in `data/rankings.json`.

**Step 3: Commit history & fetch-data changes**
Run: `git add scripts/fetch-data.js data/history/`
Run: `git commit -m "feat: add daily snapshot history tracking and real heat score delta calculation"`

---

### Task 4: Update GitHub Actions Workflow for Playwright Execution

**Files:**
- Modify: [.github/workflows/fetch-data.yml](file:///c:/Users/garoa/Desktop/antigravity/web%E3%82%B5%E3%82%A4%E3%83%88/.github/workflows/fetch-data.yml)

**Step 1: Add Playwright chromium installation step to workflow**
Add `npx playwright install --with-deps chromium` before `npm run fetch-data`.

**Step 2: Commit workflow changes**
Run: `git add .github/workflows/fetch-data.yml`
Run: `git commit -m "ci: add Playwright chromium installation to fetch-data GitHub Actions workflow"`
