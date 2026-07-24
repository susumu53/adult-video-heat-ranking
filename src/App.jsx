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
