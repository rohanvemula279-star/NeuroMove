import React, { useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, Radio, Trophy, Activity, Cpu } from 'lucide-react';


/**
 * StaggeredMenu
 * Full-height or overlay sliding drawer navigation menu with staggered item entries.
 */
export default function StaggeredMenu({
  isOpen = false,
  onClose,
  onSelectTab,
  activeTab,
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Accuracy Benchmarks', icon: Trophy, desc: '97.41% MiniRocket & 97.16% CNN-LSTM zero-leakage results' },
    { id: 'live', label: 'Live Motor Imagery Streaming', icon: Radio, desc: 'Sub-10ms dual-model inference & 4.0s oscilloscope playback' },
    { id: 'leaderboard', label: 'PhysioNet Subject Leaderboard', icon: Cpu, desc: '10-fold cross-validation across 109 subjects' },
    { id: 'explainer', label: 'Neural Signal Architecture', icon: Activity, desc: '6-stage preprocessing & Butterworth 8-30 Hz filtering' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          background: 'linear-gradient(180deg, #181820, #0C0C12)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '-16px 0 48px rgba(0, 0, 0, 0.8)',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#FFFFFF" />
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                NEUROMOVE MENU
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Staggered Navigation Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(item.id);
                    onClose();
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    animation: `fade-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 60}ms forwards`,
                    opacity: 0,
                    transform: 'translateY(16px)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={16} color={isActive ? '#FFFFFF' : 'var(--text-secondary)'} />
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF' }}>{item.label}</span>
                    </div>
                    <ArrowRight size={14} color="var(--text-tertiary)" />
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          NeuroMove Academic Research Platform · Zero-Leakage Standard
        </div>
      </div>
    </div>
  );
}
