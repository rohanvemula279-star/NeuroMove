import React from 'react';

/**
 * StarBorder
 * High-end travelling celestial border beam effect inspired by React Bits.
 * Orbiting luminous gradient along the perimeter of buttons, cards, or hero badges.
 */
export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#FFFFFF',
  speed = '4s',
  children,
  style = {},
  onClick,
  disabled = false,
  ...props
}) {
  return (
    <Component
      className={`star-border-wrapper ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1px',
        borderRadius: '9999px',
        overflow: 'hidden',
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...props}
    >
      {/* Animated rotating border beam */}
      <div
        className="star-border-glow"
        style={{
          position: 'absolute',
          inset: '-150%',
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${color} 60deg, transparent 120deg)`,
          animation: `star-border-spin ${speed} linear infinite`,
          pointerEvents: 'none',
        }}
      />
      {/* Inner surface */}
      <div
        className="star-border-inner"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'inherit',
          background: 'rgba(13, 16, 25, 0.95)',
          backdropFilter: 'blur(16px)',
          transition: 'background 0.2s ease, transform 0.2s ease',
        }}
      >
        {children}
      </div>
    </Component>
  );
}
