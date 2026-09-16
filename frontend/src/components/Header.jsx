import React from 'react';
import { Activity, ShieldCheck, Database, BookOpen, Layers } from 'lucide-react';

/**
 * Header
 * Floating capsule navigation bar inspired by modern SaaS products (Linear, Raycast, Apple).
 * Features translucent glass, backdrop blur, rounded capsule shape, and micro-interactions.
 */
export default function Header({ activeTab, onTabChange, backendHealth, backendStatus, currentTrial }) {
  const tabs = [
    { id: 'dashboard', label: 'Ground-Truth Dashboard', icon: ShieldCheck },
    { id: 'live', label: 'Live Classification', icon: Activity },
    { id: 'leaderboard', label: 'Subject Leaderboard', icon: Database },
    { id: 'explainer', label: 'Signal Explainer', icon: BookOpen },
  ];

  return (
    <header
      className="floating-nav-container"
      style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        maxWidth: '1280px',
        margin: '0 auto 36px auto',
        padding: '0 16px',
      }}
    >
      <div
        className="floating-nav-pill"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '9999px',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          gap: '12px',
        }}
      >
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(255, 255, 255, 0.15)',
            }}
          >
            <Activity size={17} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.98rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
              }}
            >
              NEUROMOVE
            </span>
            <span
              className="mono"
              style={{
                fontSize: '0.66rem',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#D4D4D8',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {backendHealth?.version ? `v${backendHealth.version}` : 'v2.0'}
            </span>
          </div>
        </div>

        {/* Center: Capsule Tab Navigation */}
        <nav
          className="nav-tabs-capsule"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`nav-tab-pill ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#FFFFFF' : '#A1A1AA',
                  background: isActive ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.5)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={14} color={isActive ? '#FFFFFF' : '#A1A1AA'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry Status & Trial Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '6px' }}>
          {currentTrial && (
            <div
              id="header-dataset-loaded-badge"
              className="mono"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
              }}
              title={`Loaded trial: ${currentTrial.trial_id}`}
            >
              <Layers size={12} />
              <span>{currentTrial.dataset_name ? currentTrial.dataset_name.split(':')[0] : 'ACTIVE TRIAL'}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.74rem',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: backendStatus === 'online' ? '#10B981' : '#71717A',
                boxShadow: backendStatus === 'online' ? '0 0 10px #10B981, 0 0 20px rgba(16, 185, 129, 0.6)' : 'none',
              }}
            />
            <span
              style={{
                color: backendStatus === 'online' ? '#34D399' : '#71717A',
                fontWeight: 700,
                fontSize: '0.72rem',
                letterSpacing: '0.04em',
              }}
            >
              {backendStatus === 'online' ? '163 HZ ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
