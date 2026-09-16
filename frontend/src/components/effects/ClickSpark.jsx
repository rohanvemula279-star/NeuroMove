import React, { useRef, useEffect } from 'react';

/**
 * ClickSpark
 * High-performance, crisp click spark effect inspired by React Bits.
 * Emits radial spark rays from the exact cursor coordinate on every click/tap.
 * Efficient requestAnimationFrame loop that sleeps when no sparks are active.
 */
export default function ClickSpark({
  sparkColor = '#FFFFFF',
  sparkSize = 10,
  sparkRadius = 22,
  sparkCount = 8,
  duration = 440,
  extraScale = 1.0,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const animIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const easeOutCubic = (t) => --t * t * t + 1;

    const animate = (now) => {
      ctx.clearRect(0, 0, width, height);

      const activeSparks = [];

      for (let i = 0; i < sparksRef.current.length; i++) {
        const spark = sparksRef.current[i];
        const elapsed = now - spark.startTime;
        const progress = Math.min(1, elapsed / duration);

        if (progress < 1) {
          activeSparks.push(spark);

          const eased = easeOutCubic(progress);
          const currentDist = eased * sparkRadius * extraScale;
          const currentLength = sparkSize * (1 - progress);
          const alpha = 1 - progress;

          const startX = spark.x + Math.cos(spark.angle) * currentDist;
          const startY = spark.y + Math.sin(spark.angle) * currentDist;
          const endX = spark.x + Math.cos(spark.angle) * (currentDist + currentLength);
          const endY = spark.y + Math.sin(spark.angle) * (currentDist + currentLength);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = spark.color;
          ctx.lineWidth = 2 * (1 - progress * 0.5);
          ctx.globalAlpha = alpha;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();
        }
      }

      sparksRef.current = activeSparks;

      if (activeSparks.length > 0) {
        animIdRef.current = requestAnimationFrame(animate);
      } else {
        animIdRef.current = null;
      }
    };

    const handleClick = (e) => {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      const colors = [sparkColor, '#FFFFFF', '#00F0FF', '#818CF8'];

      for (let i = 0; i < sparkCount; i++) {
        const baseAngle = (i / sparkCount) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * 0.35;
        const angle = baseAngle + jitter;
        const color = colors[i % colors.length];

        sparksRef.current.push({
          x,
          y,
          angle,
          color,
          startTime: now,
        });
      }

      if (!animIdRef.current) {
        animIdRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('pointerdown', handleClick, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleClick);
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraScale]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
