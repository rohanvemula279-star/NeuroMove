import React, { useRef, useState } from 'react';

/**
 * SpotlightCard
 * Modern SaaS Depth & Spotlight Card inspired by React Bits.
 * Tracks pointer movement to render a soft, elegant radial spotlight and border glow.
 */
export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.08)',
  borderColor = 'rgba(255, 255, 255, 0.12)',
  hoverBorderColor = 'rgba(255, 255, 255, 0.38)',
  style = {},
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`spotlight-card ${className}`}
      style={{
        position: 'relative',
        borderRadius: '18px',
        border: `1px solid ${isHovered ? hoverBorderColor : borderColor}`,
        background: 'rgba(14, 14, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 40px -15px rgba(0, 0, 0, 0.85), 0 0 25px -5px rgba(255, 255, 255, 0.08)'
          : '0 8px 24px rgba(0, 0, 0, 0.55)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.25s ease',
          background: `radial-gradient(380px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Card Content */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
