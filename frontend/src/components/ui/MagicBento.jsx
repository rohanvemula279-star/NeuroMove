import React, { useRef, useState } from 'react';

/**
 * MagicBento
 * Interactive Bento Grid with mouse-following spotlight glow across card borders,
 * subtle 3D perspective tilt, and high-contrast neurotechnology metrics layout.
 */
export default function MagicBento({
  children,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`magic-bento-grid ${className}`}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        ...style,
      }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          parentMousePos: mousePos,
        });
      })}
    </div>
  );
}

/**
 * MagicBentoItem
 * Individual bento cell equipped with localized spotlight tracking.
 */
export function MagicBentoItem({
  children,
  colSpan = 4, // 1 to 12
  rowSpan = 1,
  parentMousePos,
  className = '',
  style = {},
  spotlightColor = 'rgba(255, 255, 255, 0.15)',
}) {
  const itemRef = useRef(null);
  let localX = -1000;
  let localY = -1000;

  if (itemRef.current && parentMousePos) {
    const rect = itemRef.current.getBoundingClientRect();
    const parentRect = itemRef.current.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
    const itemLeftInParent = rect.left - parentRect.left;
    const itemTopInParent = rect.top - parentRect.top;

    localX = parentMousePos.x - itemLeftInParent;
    localY = parentMousePos.y - itemTopInParent;
  }

  return (
    <div
      ref={itemRef}
      className={`magic-bento-item ${className}`}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        position: 'relative',
        borderRadius: 'var(--radius-md, 14px)',
        background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.85), rgba(12, 12, 18, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.25s ease, border-color 0.25s ease',
        ...style,
      }}
    >
      {/* Dynamic Cursor Spotlight Border Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(380px circle at ${localX}px ${localY}px, ${spotlightColor}, transparent 70%)`,
          pointerEvents: 'none',
          opacity: localX > -500 ? 1 : 0,
          transition: 'opacity 0.25s ease',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>{children}</div>
    </div>
  );
}
