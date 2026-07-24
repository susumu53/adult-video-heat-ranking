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
