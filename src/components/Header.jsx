import React from 'react';

export function Header({ updatedAt }) {
  return (
    <header style={{ borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0', background: 'rgba(18,24,39,0.85)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🔥</span>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #ff2a6d, #00f5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
              熱狂動画チェッカー
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
              Target: <a href="https://kanetu.doorblog.jp/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>kanetu.doorblog.jp</a>
            </div>
          </div>
        </div>
        {updatedAt && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
            更新日時: {new Date(updatedAt).toLocaleString('ja-JP')}
          </div>
        )}
      </div>
    </header>
  );
}
