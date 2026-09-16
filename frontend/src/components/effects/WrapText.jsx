import React from 'react';

/**
 * WrapText
 * Kinetic wrapped badge & typography component inspired by React Bits.
 * Formats phrases into wrapped kinetic pills with subtle magnetic elevation.
 */
export default function WrapText({
  items = [],
  highlightIndex = 0,
  onItemClick,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`wrap-text-group ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        ...style,
      }}
    >
      {items.map((item, idx) => {
        const isHighlight = idx === highlightIndex;
        const label = typeof item === 'string' ? item : item.label;
        const icon = typeof item === 'object' ? item.icon : null;

        return (
          <span
            key={idx}
            onClick={() => onItemClick && onItemClick(item, idx)}
            className={`wrap-pill ${isHighlight ? 'wrap-pill-active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.02em',
              background: isHighlight ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
              border: isHighlight
                ? '1px solid rgba(255, 255, 255, 0.45)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: isHighlight ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: onItemClick ? 'pointer' : 'default',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: 'translateY(0)',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.borderColor = isHighlight
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.boxShadow = isHighlight
                ? '0 4px 16px rgba(255, 255, 255, 0.2)'
                : 'none';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = isHighlight
                ? 'rgba(255, 255, 255, 0.45)'
                : 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.color = isHighlight ? '#FFFFFF' : 'var(--text-secondary)';
            }}
          >
            {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {label}
          </span>
        );
      })}
    </div>
  );
}
