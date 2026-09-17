import React, { useRef, useState, useEffect } from 'react';

/**
 * VariableProximity
 * Character grid where individual letters scale, illuminate, and bend dynamically
 * when the pointer hovers close to them.
 */
export default function VariableProximity({
  label = '',
  radius = 120,
  falloff = 'linear', // 'linear' | 'gaussian'
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const letterRefs = useRef([]);
  const [coords, setCoords] = useState({ x: -9999, y: -9999 });

  const letters = label.split('');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handlePointerLeave = () => {
      setCoords({ x: -9999, y: -9999 });
    };

    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className={`variable-proximity-wrap ${className}`}
      style={{
        display: 'inline-flex',
        cursor: 'crosshair',
        userSelect: 'none',
        ...style,
      }}
    >
      {letters.map((char, i) => {
        let factor = 0;
        const letterEl = letterRefs.current[i];
        if (letterEl && coords.x > -1000) {
          const lx = letterEl.offsetLeft + letterEl.offsetWidth / 2;
          const ly = letterEl.offsetTop + letterEl.offsetHeight / 2;
          const d = Math.hypot(coords.x - lx, coords.y - ly);
          if (d < radius) {
            factor = falloff === 'gaussian'
              ? Math.exp(-Math.pow(d / (radius * 0.5), 2))
              : 1 - d / radius;
          }
        }

        const scale = 1 + factor * 0.45;
        const brightness = 0.65 + factor * 0.35;

        return (
          <span
            key={i}
            ref={(el) => (letterRefs.current[i] = el)}
            style={{
              display: 'inline-block',
              transform: `scale(${scale}) translateY(${-factor * 4}px)`,
              opacity: brightness,
              color: factor > 0.3 ? '#FFFFFF' : 'inherit',
              transition: 'transform 0.12s ease-out, opacity 0.15s ease',
              willChange: 'transform, opacity',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}
