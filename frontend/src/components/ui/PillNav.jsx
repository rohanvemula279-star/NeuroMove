import React, { useRef, useEffect, useState } from 'react';

/**
 * PillNav
 * Sleek floating pill capsule navigation bar with an animated sliding glass background indicator
 * that follows the active route smoothly.
 */
export default function PillNav({
  items = [],
  activeId,
  onChange,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const itemRefs = useRef({});

  useEffect(() => {
    const activeEl = itemRefs.current[activeId];
    if (activeEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
        opacity: 1,
      });
    }
  }, [activeId, items]);

  return (
    <div
      ref={containerRef}
      className={`pill-nav-bar ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '5px',
        borderRadius: '9999px',
        background: 'rgba(20, 20, 28, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Sliding Glass Capsule Indicator */}
      <span
        style={{
          position: 'absolute',
          top: '5px',
          bottom: '5px',
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.16)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          boxShadow: '0 0 16px rgba(255, 255, 255, 0.25)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Nav Buttons */}
      {items.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            ref={(el) => (itemRefs.current[item.id] = el)}
            onClick={() => onChange && onChange(item.id)}
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.01em',
              color: isActive ? '#FFFFFF' : 'var(--text-tertiary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
          >
            {Icon && <Icon size={15} />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
