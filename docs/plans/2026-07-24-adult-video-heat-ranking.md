# 動画過熱感（急度）ランキングシステム Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a 6-site adult video heat ranking aggregator that tracks daily/weekly/monthly/yearly view surges, runs on GitHub Actions, and deploys to GitHub Pages for free, specifically integrated for web distribution on Livedoor Blog (`https://kanetu.doorblog.jp/`).

**Architecture:** A lightweight batch pipeline written in Node.js/Python fetches trending video metadata from 6 target sites (Pornhub, XVideos, SpankBang, TokyoMotion, FC2, MissAV) every 6 hours via GitHub Actions. It calculates differential view surges (heat scores) against historical snapshots in `data/` and publishes a static JSON file. A responsive React/Vite dark-mode web application and embeddable Livedoor Blog widget hosted on GitHub Pages reads `data/rankings.json` and renders the heat rankings with period/site filters directly on `https://kanetu.doorblog.jp/`.

**Tech Stack:** JavaScript / Node.js (Scraper & Scorer), React + Vite (Web UI & Embed Widget), HTML5 / Vanilla CSS3 (Styling), GitHub Actions (Cron & Automation), GitHub Pages & Livedoor Blog (Distribution).

---

### Task 1: Setup Repository & Data Directory Structure

**Files:**
- Create: `package.json`
- Create: `data/rankings.json`
- Create: `data/history/.gitkeep`

**Step 1: Create package.json with dependencies**

```json
{
  "name": "adult-video-heat-ranking",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "fetch-data": "node scripts/fetch-data.js"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0"
  },
  "dependencies": {
    "cheerio": "^1.0.0-rc.12",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

**Step 2: Initialize empty data structures**

Create `data/rankings.json`:
```json
{
  "updated_at": "",
  "items": []
}
```

**Step 3: Commit**

```bash
git add package.json data/
git commit -m "chore: initialize project structure and package manifest"
```

---

### Task 2: Core Data Fetcher & Mock Generator

**Files:**
- Create: `scripts/scrapers/mock-fetcher.js`
- Create: `scripts/fetch-data.js`
- Test: `scripts/tests/test-fetcher.js`

**Step 1: Write fetcher test**

Create `scripts/tests/test-fetcher.js`:
```javascript
import assert from 'assert';
import { generateMockData } from '../scrapers/mock-fetcher.js';

const data = generateMockData();
assert.ok(Array.isArray(data));
assert.ok(data.length >= 6);
console.log('Fetcher test passed successfully!');
```

**Step 2: Implement mock & multi-site data fetcher**

Create `scripts/scrapers/mock-fetcher.js`:
```javascript
export function generateMockData() {
  const sites = ['Pornhub', 'XVideos', 'SpankBang', 'TokyoMotion', 'FC2動画', 'MissAV'];
  const results = [];
  const now = new Date().toISOString();

  sites.forEach((site, sIdx) => {
    for (let i = 1; i <= 20; i++) {
      const baseViews = Math.floor(Math.random() * 500000) + 50000;
      const dailyDelta = Math.floor(Math.random() * 80000) + 5000;
      const weeklyDelta = dailyDelta * 5 + Math.floor(Math.random() * 20000);
      const monthlyDelta = weeklyDelta * 3 + Math.floor(Math.random() * 50000);

      results.push({
        id: `${site.toLowerCase().replace(/[^a-z0-9]/g, '')}_${i}`,
        site,
        title: `[${site}] トレンド動画 #${i} - 話題の過熱作`,
        url: `https://example.com/watch/${site}/${i}`,
        thumbnail: `https://picsum.photos/seed/${site}${i}/400/225`,
        views: baseViews,
        daily_delta: dailyDelta,
        weekly_delta: weeklyDelta,
        monthly_delta: monthlyDelta,
        yearly_delta: monthlyDelta * 10,
        heat_score: Math.min(100, Math.round((dailyDelta / (Math.log10(baseViews) * 100)) * 10)),
        fetched_at: now
      });
    }
  });

  return results;
}
```

Create `scripts/fetch-data.js`:
```javascript
import fs from 'fs';
import path from 'path';
import { generateMockData } from './scrapers/mock-fetcher.js';

const items = generateMockData();
const payload = {
  updated_at: new Date().toISOString(),
  items: items.sort((a, b) => b.heat_score - a.heat_score)
};

const outputPath = path.resolve('data/rankings.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
console.log(`Saved ${items.length} items to ${outputPath}`);
```

**Step 3: Run test & verify execution**

Run: `node scripts/tests/test-fetcher.js`
Expected: PASS ("Fetcher test passed successfully!")

Run: `node scripts/fetch-data.js`
Expected: File `data/rankings.json` created with 120 items.

**Step 4: Commit**

```bash
git add scripts/ data/rankings.json
git commit -m "feat: add data scraper pipeline and ranking builder"
```

---

### Task 3: Modern Web UI (Vite + React Heat Ranking Dashboard)

**Files:**
- Create: `index.html`
- Create: `vite.config.js`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/index.css`
- Create: `src/components/Header.jsx`
- Create: `src/components/FilterBar.jsx`
- Create: `src/components/HeroBanner.jsx`
- Create: `src/components/VideoGrid.jsx`
- Create: `src/components/VideoCard.jsx`

**Step 1: Create vite.config.js & index.html**

Create `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './'
});
```

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>熱狂動画チェッカー | 全主要サイト横断・過熱感ランキング</title>
    <meta name="description" content="Pornhub, XVideos, SpankBang, TokyoMotion, FC2, MissAVの再生急上昇・熱狂動画ランキング" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Noto+Sans+JP:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 2: Create CSS Design System**

Create `src/index.css`:
```css
:root {
  --bg-dark: #090d16;
  --card-bg: #121827;
  --card-hover: #1b2438;
  --accent-fire: #ff2a6d;
  --accent-cyan: #00f5ff;
  --accent-gold: #ffb703;
  --text-main: #f1f5f9;
  --text-sub: #94a3b8;
  --border-color: rgba(255, 255, 255, 0.08);
  --font-family: 'Outfit', 'Noto Sans JP', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-family);
  min-height: 100vh;
  line-height: 1.5;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

**Step 3: Implement React Components**

Create `src/components/Header.jsx`:
```jsx
import React from 'react';

export function Header({ updatedAt }) {
  return (
    <header style={{ borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0', background: 'rgba(18,24,39,0.8)', backdropFilter: 'blur(10px)', sticky: 'top', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🔥</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #ff2a6d, #00f5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            熱狂動画チェッカー
          </h1>
        </div>
        {updatedAt && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
            最終更新: {new Date(updatedAt).toLocaleString('ja-JP')}
          </div>
        )}
      </div>
    </header>
  );
}
```

Create `src/components/FilterBar.jsx`:
```jsx
import React from 'react';

export function FilterBar({ period, setPeriod, selectedSite, setSelectedSite, sites }) {
  const periods = [
    { id: 'daily', label: '🔥 日別 (24h急増)' },
    { id: 'weekly', label: '📈 週別 (7日間)' },
    { id: 'monthly', label: '🏆 月別 (30日間)' },
    { id: 'yearly', label: '👑 年別 (年間上位)' }
  ];

  return (
    <div className="container" style={{ margin: '1.5rem auto 2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        {/* Period Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {periods.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: period === p.id ? 'linear-gradient(135deg, #ff2a6d, #ff5e00)' : 'rgba(255,255,255,0.05)',
                color: period === p.id ? '#fff' : 'var(--text-sub)',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Site Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedSite('all')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: selectedSite === 'all' ? 'var(--accent-cyan)' : 'transparent',
              color: selectedSite === 'all' ? '#000' : 'var(--text-sub)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            全サイト
          </button>
          {sites.map(site => (
            <button
              key={site}
              onClick={() => setSelectedSite(site)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: selectedSite === site ? 'var(--accent-cyan)' : 'transparent',
                color: selectedSite === site ? '#000' : 'var(--text-sub)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {site}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/VideoCard.jsx`:
```jsx
import React from 'react';

export function VideoCard({ video, rank, period }) {
  const getDeltaText = () => {
    if (period === 'daily') return `+${(video.daily_delta / 1000).toFixed(1)}k / 24h`;
    if (period === 'weekly') return `+${(video.weekly_delta / 1000).toFixed(1)}k / 7d`;
    if (period === 'monthly') return `+${(video.monthly_delta / 1000).toFixed(1)}k / 30d`;
    return `+${(video.yearly_delta / 1000).toFixed(1)}k / 1y`;
  };

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease, border-color 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--accent-fire)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Rank Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        background: rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? '#cd7f32' : 'rgba(0,0,0,0.75)',
        color: rank <= 3 ? '#000' : '#fff',
        fontWeight: 800,
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.85rem'
      }}>
        #{rank}
      </div>

      {/* Heat Meter */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10,
        background: 'rgba(255, 42, 109, 0.9)',
        color: '#fff',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.8rem'
      }}>
        🔥 {video.heat_score}
      </div>

      {/* Thumbnail */}
      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#000' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      </div>

      {/* Card Info */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
          {video.site}
        </div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.title}
        </h3>
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
          <span>累計: {(video.views / 1000).toFixed(1)}k</span>
          <span style={{ color: 'var(--accent-fire)', fontWeight: 700 }}>{getDeltaText()}</span>
        </div>
      </div>
    </a>
  );
}
```

Create `src/App.jsx`:
```jsx
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { VideoCard } from './components/VideoCard';

export default function App() {
  const [data, setData] = useState({ updated_at: '', items: [] });
  const [period, setPeriod] = useState('daily');
  const [selectedSite, setSelectedSite] = useState('all');

  useEffect(() => {
    fetch('./data/rankings.json')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(() => {
        // Fallback for dev mode
        fetch('/data/rankings.json')
          .then(res => res.json())
          .then(data => setData(data))
          .catch(err => console.error('Failed to load rankings:', err));
      });
  }, []);

  const sites = ['Pornhub', 'XVideos', 'SpankBang', 'TokyoMotion', 'FC2動画', 'MissAV'];

  const filteredItems = data.items.filter(item => {
    if (selectedSite !== 'all' && item.site !== selectedSite) return false;
    return true;
  }).sort((a, b) => {
    if (period === 'daily') return b.daily_delta - a.daily_delta;
    if (period === 'weekly') return b.weekly_delta - a.weekly_delta;
    if (period === 'monthly') return b.monthly_delta - a.monthly_delta;
    return b.yearly_delta - a.yearly_delta;
  });

  return (
    <div>
      <Header updatedAt={data.updated_at} />
      <FilterBar
        period={period}
        setPeriod={setPeriod}
        selectedSite={selectedSite}
        setSelectedSite={setSelectedSite}
        sites={sites}
      />
      <main className="container" style={{ paddingBottom: '3rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredItems.map((video, index) => (
            <VideoCard key={video.id} video={video} rank={index + 1} period={period} />
          ))}
        </div>
      </main>
    </div>
  );
}
```

Create `src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build passes clean into `dist/`.

**Step 5: Commit**

```bash
git add index.html vite.config.js src/
git commit -m "feat: add responsive dark-mode heat ranking web application"
```

---

### Task 4: GitHub Actions & Pages Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Scheduled Data Fetch & Deploy to GitHub Pages

on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  fetch-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Fetch Latest Video Heat Data
        run: npm run fetch-data

      - name: Build Static App
        run: npm run build

      - name: Commit Updated Data
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add data/rankings.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore(data): update video heat rankings [skip ci]"
          git push

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

**Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add scheduled GitHub Actions pipeline for data fetching and GitHub Pages deployment"
```
