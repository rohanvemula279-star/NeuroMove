import React, { useRef, useState } from 'react';
import { LayoutDashboard, Radio, Trophy, Activity, Zap, Layers, RefreshCw } from 'lucide-react';

/**
 * Dock
 * macOS-style floating bottom application dock with smooth distance-based icon magnification.
 * Provides instant tactile navigation between Dashboard, Live Stream, Leaderboard, and Explainer.
 */
export default function Dock({
  activeTab = 'dashboard',
  onTabChange,
  onQuickAction,
  className = '',
}) {
  const dockRef = useRef(null);
  const [mouseX, setMouseX] = useState(null);

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Playback', icon: Radio },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'explainer', label: 'Signal Explainer', icon: Activity },
    { id: 'quick_test', label: 'Quick Benchmark', icon: Zap, isAction: true },
  ];

  const handlePointerMove = (e) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  };

  const handlePointerLeave = () => {
    setMouseX(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        pointerEvents: 'auto',
      }}
    >
      <div
        ref={dockRef}
        className={`dock-container ${className}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 18px',
          background: 'rgba(18, 18, 24, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          // Distance magnification calculation
          let scale = 1;
          if (mouseX !== null) {
            const itemWidth = 48;
            const itemCenter = idx * (itemWidth + 12) + itemWidth / 2 + 18;
            const dist = Math.abs(mouseX - itemCenter);
            const maxDist = 130;
            if (dist < maxDist) {
              scale = 1 + (1 - dist / maxDist) * 0.45; // up to 1.45x
            }
          }


          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction && onQuickAction) {
                  onQuickAction(item.id);
                } else if (onTabChange) {
                  onTabChange(item.id);
                }
              }}
              className="dock-item"
              title={item.label}
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: isActive
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: isActive
                  ? '1px solid rgba(255, 255, 255, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                transform: `scale(${scale}) translateY(${scale > 1 ? -(scale - 1) * 16 : 0}px)`,
                transformOrigin: 'bottom center',
                transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease',
                boxShadow: isActive ? '0 0 16px rgba(255, 255, 255, 0.3)' : 'none',
              }}
            >
              <Icon size={20} />

              {/* Active Dot Indicator */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 0 6px #FFFFFF',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
