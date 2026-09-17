import React, { useRef, useState } from 'react';

/**
 * SpecularButton
 * Luxury glassmorphic CTA button with specular radial highlight reflection following cursor coordinates.
 */
export default function SpecularButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'glow'
  icon,
  className = '',
  style = {},
  disabled = false,
}) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const btnRef = useRef(null);

  const handlePointerMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  const getBg = () => {
    if (variant === 'glow') {
      return 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))';
    }
    if (variant === 'secondary') {
      return 'rgba(255, 255, 255, 0.05)';
    }
    return 'linear-gradient(135deg, #FFFFFF, #E4E4E7)';
  };

  const getColor = () => {
    return variant === 'primary' ? '#000000' : '#FFFFFF';
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      disabled={disabled}
      onPointerMove={handlePointerMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`specular-button ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 24px',
        borderRadius: '9999px',
        fontSize: '0.88rem',
        fontWeight: 700,
        color: getColor(),
        background: getBg(),
        border: '1px solid rgba(255, 255, 255, 0.35)',
        boxShadow: isHovered
          ? '0 12px 28px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          : '0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered && !disabled ? 'translateY(-2px) scale(1.02)' : 'none',
        ...style,
      }}
    >
      {/* Specular Radial Light Sheen */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle 80px at ${pos.x}% ${pos.y}%, rgba(255, 255, 255, 0.6) 0%, transparent 80%)`,
          opacity: isHovered ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease',
          mixBlendMode: variant === 'primary' ? 'overlay' : 'screen',
        }}
      />

      {/* Button Content */}
      <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        {children}
      </span>
    </button>
  );
}
