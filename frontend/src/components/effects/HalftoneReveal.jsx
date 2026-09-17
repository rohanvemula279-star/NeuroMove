import React, { useState, useRef } from 'react';

/**
 * HalftoneReveal
 * Retro-futuristic halftone dot matrix mask reveal.
 * Moving pointer over card peels away a halftone pattern to reveal hidden technical specs, diagrams, or seals.
 */
export default function HalftoneReveal({
  children,
  revealContent,
  dotSize = 6,
  className = '',
  style = {},
}) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef(null);

  const onPointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`halftone-reveal-card ${className}`}
      onPointerMove={onPointerMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md, 12px)',
        cursor: 'pointer',
        ...style,
      }}
    >
      {/* Base / Primary Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

      {/* Halftone / Revealed Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          background: 'rgba(10, 10, 15, 0.95)',
          maskImage: `radial-gradient(circle 140px at ${pos.x}% ${pos.y}%, black 30%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 140px at ${pos.x}% ${pos.y}%, black 30%, transparent 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Halftone Dot Matrix Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.22) 1.5px, transparent 1.5px)`,
            backgroundSize: `${dotSize * 2}px ${dotSize * 2}px`,
            opacity: 0.7,
          }}
        />
        <div style={{ position: 'relative', zIndex: 3, width: '100%' }}>
          {revealContent}
        </div>
      </div>
    </div>
  );
}
