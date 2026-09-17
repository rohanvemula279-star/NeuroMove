import React, { useEffect, useRef } from 'react';

/**
 * FloatingLines
 * Fullscreen ambient floating line waves representing EEG micro-rhythms (8-30 Hz).
 * Features smooth continuous harmonic oscillations that warp and deflect gently near the cursor.
 */
export default function FloatingLines({
  lineCount = 8,
  lineColor = 'rgba(255, 255, 255, 0.07)',
  activeLineColor = 'rgba(255, 255, 255, 0.22)',
  speed = 0.008,
  amplitude = 42,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let phase = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    const animate = () => {
      phase += speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const step = w / 64;

      for (let l = 0; l < lineCount; l++) {
        const baseHeight = (h / (lineCount + 1)) * (l + 1);
        const lFreq = 0.0018 + l * 0.0006;
        const lPhase = phase + l * 0.45;
        const lAmp = amplitude * (0.6 + (l % 3) * 0.35);

        ctx.beginPath();
        for (let x = 0; x <= w; x += step) {
          let y = baseHeight + Math.sin(x * lFreq + lPhase) * lAmp;

          // Mouse deflection
          if (mouseRef.current.active) {
            const dist = Math.hypot(x - mouseRef.current.x, y - mouseRef.current.y);
            if (dist < 180) {
              const force = (1 - dist / 180) * 38;
              y += (mouseRef.current.y > y ? -force : force);
            }
          }

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = mouseRef.current.active ? activeLineColor : lineColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animId);
    };
  }, [lineCount, lineColor, activeLineColor, speed, amplitude]);

  return (
    <canvas
      ref={canvasRef}
      className={`floating-lines-canvas ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
}
