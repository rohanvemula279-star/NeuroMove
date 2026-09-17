import React, { useEffect, useRef, useState } from 'react';

/**
 * TextPressure
 * Dynamic variable font & scale pressure effect inspired by ReactBits.
 * Each character adjusts its weight, width, and scale based on its Euclidean distance to the pointer.
 */
export default function TextPressure({
  text = '',
  maxDist = 180,
  minWeight = 300,
  maxWeight = 900,
  minScale = 0.95,
  maxScale = 1.25,
  className = '',
  style = {},
  color = '#FFFFFF',
}) {
  const containerRef = useRef(null);
  const charRefs = useRef([]);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999, active: false });

  const chars = text.split('');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY, active: true });
    };

    const onPointerLeave = () => {
      setMousePos({ x: -9999, y: -9999, active: false });
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className={`text-pressure-container ${className}`}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        cursor: 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {chars.map((char, idx) => {
        let weight = minWeight;
        let scale = 1;
        let glow = 0;

        if (mousePos.active && charRefs.current[idx]) {
          const rect = charRefs.current[idx].getBoundingClientRect();
          const charCenterX = rect.left + rect.width / 2;
          const charCenterY = rect.top + rect.height / 2;
          const dist = Math.hypot(mousePos.x - charCenterX, mousePos.y - charCenterY);

          if (dist < maxDist) {
            const factor = 1 - dist / maxDist; // 0 to 1
            weight = Math.round(minWeight + (maxWeight - minWeight) * factor);
            scale = minScale + (maxScale - minScale) * factor;
            glow = factor;
          }
        }

        return (
          <span
            key={idx}
            ref={(el) => (charRefs.current[idx] = el)}
            style={{
              display: 'inline-block',
              fontWeight: weight,
              transform: `scale(${scale})`,
              color,
              textShadow: glow > 0.2 ? `0 0 ${glow * 14}px rgba(255, 255, 255, ${glow * 0.8})` : 'none',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), font-weight 0.15s ease, text-shadow 0.2s ease',
              willChange: 'transform, font-weight',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}
