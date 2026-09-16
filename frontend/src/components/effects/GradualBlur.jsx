import React from 'react';

/**
 * GradualBlur
 * Progressive stepped backdrop-filter blur mask creating an ultra-soft glass transition.
 * Ideal for header horizons, hero bottoms, or floating cards.
 */
export default function GradualBlur({
  position = 'top', // 'top' | 'bottom'
  height = '80px',
  maxBlur = 16,
  steps = 5,
  zIndex = 10,
  style = {},
}) {
  const stepElements = Array.from({ length: steps }, (_, i) => {
    const progress = (i + 1) / steps;
    const blurPx = (progress * maxBlur).toFixed(1);
    const opacity = (progress * 0.9).toFixed(2);
    const startPct = ((i / steps) * 100).toFixed(1);
    const endPct = (((i + 1) / steps) * 100).toFixed(1);

    const isTop = position === 'top';
    const mask = isTop
      ? `linear-gradient(to bottom, rgba(0,0,0,${opacity}) ${startPct}%, rgba(0,0,0,0) ${endPct}%)`
      : `linear-gradient(to top, rgba(0,0,0,${opacity}) ${startPct}%, rgba(0,0,0,0) ${endPct}%)`;

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: `blur(${blurPx}px)`,
          WebkitBackdropFilter: `blur(${blurPx}px)`,
          maskImage: mask,
          WebkitMaskImage: mask,
          pointerEvents: 'none',
        }}
      />
    );
  });

  return (
    <div
      className={`gradual-blur gradual-blur-${position}`}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [position]: 0,
        height,
        pointerEvents: 'none',
        zIndex,
        overflow: 'hidden',
        ...style,
      }}
      aria-hidden="true"
    >
      {stepElements}
    </div>
  );
}
