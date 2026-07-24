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
