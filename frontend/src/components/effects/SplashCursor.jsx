import React, { useEffect, useRef } from 'react';

/**
 * SplashCursor
 * High-performance fluid particle splash cursor that reacts organically to pointer movement and clicks.
 * Lightweight, GPU-friendly 2D canvas simulation with physics damping and pointer-events: none.
 */
export default function SplashCursor({
  colorCyan = 'rgba(0, 240, 255, ',
  colorIndigo = 'rgba(129, 140, 248, ',
  particleCount = 28,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let lastX = null;
    let lastY = null;

    const addParticles = (x, y, count = 2, speedMultiplier = 1) => {
      for (let i = 0; i < count; i++) {
        if (particles.length > particleCount * 2) {
          particles.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 1.8 + 0.6) * speedMultiplier;
        const isCyan = Math.random() > 0.4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 14 + 8,
          maxRadius: Math.random() * 26 + 18,
          life: 1.0,
          decay: Math.random() * 0.02 + 0.015,
          colorBase: isCyan ? colorCyan : colorIndigo,
        });
      }
    };

    const handlePointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      if (lastX !== null && lastY !== null) {
        const dx = x - lastX;
        const dy = y - lastY;
        const dist = Math.hypot(dx, dy);
        if (dist > 4) {
          addParticles(x, y, Math.min(Math.floor(dist / 12) + 1, 3), 1);
        }
      } else {
        addParticles(x, y, 2, 1);
      }
      lastX = x;
      lastY = y;
    };

    const handlePointerDown = (e) => {
      addParticles(e.clientX, e.clientY, 12, 2.5);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update fluid splash particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.radius += (p.maxRadius - p.radius) * 0.08;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, p.life * 0.22);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `${p.colorBase}${alpha})`);
        grad.addColorStop(0.6, `${p.colorBase}${alpha * 0.4})`);
        grad.addColorStop(1, `${p.colorBase}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [colorCyan, colorIndigo, particleCount]);

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
        zIndex: 1,
      }}
      aria-hidden="true"
    />
  );
}
