export function generateMockData() {
  const sites = ['Pornhub', 'XVideos', 'SpankBang', 'TokyoMotion', 'FC2動画', 'MissAV'];
  const results = [];
  const now = new Date().toISOString();

  const siteUrlMap = {
    'Pornhub': 'https://www.pornhub.com/video?o=ht',
    'XVideos': 'https://www.xvideos.com/best',
    'SpankBang': 'https://spankbang.com/trending_videos',
    'TokyoMotion': 'https://www.tokyomotion.net/videos?sort=views',
    'FC2動画': 'https://video.fc2.com/ja/list/',
    'MissAV': 'https://missav.com/ja/today-hot'
  };

  sites.forEach((site) => {
    const siteBaseUrl = siteUrlMap[site] || 'https://www.tokyomotion.net/';
    for (let i = 1; i <= 20; i++) {
      const baseViews = Math.floor(Math.random() * 500000) + 50000;
      const dailyDelta = Math.floor(Math.random() * 80000) + 5000;
      const weeklyDelta = dailyDelta * 5 + Math.floor(Math.random() * 20000);
      const monthlyDelta = weeklyDelta * 3 + Math.floor(Math.random() * 50000);

      results.push({
        id: `${site.toLowerCase().replace(/[^a-z0-9]/g, '')}_${i}`,
        site,
        title: `[${site}] トレンド動画 #${i} - 話題の過熱作`,
        url: siteBaseUrl,
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
