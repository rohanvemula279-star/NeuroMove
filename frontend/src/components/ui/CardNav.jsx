import React from 'react';
import { ArrowUpRight, Radio, Trophy, Activity, LayoutDashboard } from 'lucide-react';

/**
 * CardNav
 * Visual interactive preview cards that function as quick navigation launchers across the platform.
 */
export default function CardNav({
  onSelectTab,
  activeTab,
  className = '',
  style = {},
}) {
  const cards = [
    {
      id: 'dashboard',
      title: 'Precision Benchmarks',
      desc: 'Full transparency metrics, confusion matrix, and zero-leakage validation.',
      icon: LayoutDashboard,
      badge: '97.41% ACC',
      color: '#38BDF8',
    },
    {
      id: 'live',
      title: 'Live EEG Playback',
      desc: 'Real-time oscilloscope streaming & dual-model consensus evaluation.',
      icon: Radio,
      badge: 'SUB-10MS',
      color: '#10B981',
    },
    {
      id: 'leaderboard',
      title: 'Subject Leaderboard',
      desc: '10-fold cross-validation breakdown across 109 PhysioNet subjects.',
      icon: Trophy,
      badge: '109 COHORTS',
      color: '#60A5FA',
    },
    {
      id: 'explainer',
      title: 'Signal Architecture',
      desc: '6-stage Butterworth preprocessing & sensorimotor electrode montage.',
      icon: Activity,
      badge: '5 PAIRS',
      color: '#F43F5E',
    },
  ];

  return (
    <div
      className={`card-nav-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        ...style,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeTab === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectTab && onSelectTab(card.id)}
            style={{
              borderRadius: 'var(--radius-md, 14px)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(35, 35, 48, 0.95), rgba(18, 18, 25, 0.98))'
                : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${isActive ? card.color : 'rgba(255, 255, 255, 0.1)'}`,
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = card.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = isActive ? card.color : 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${card.color}22`,
                  border: `1px solid ${card.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                }}
              >
                <Icon size={18} />
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: card.color,
                }}
              >
                {card.badge}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{card.title}</span>
                <ArrowUpRight size={14} color="var(--text-tertiary)" />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                {card.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
