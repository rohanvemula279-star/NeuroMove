import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollVelocity
 * Kinetic infinite marquee ribbon that accelerates and adjusts drift velocity based on user scroll speed.
 */
export default function ScrollVelocity({
  texts = ['NEUROMOVE BCI', '5-PAIR SPATIAL FUSION', 'ZERO DATA LEAKAGE', '97.41% TEST ACC', '6.1 MS LATENCY'],
  baseVelocity = 1.2,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const velocityRef = useRef(baseVelocity);
  const lastScrollY = useRef(window.scrollY);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animId;

    const onScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY.current;
      const deltaTime = Math.max(1, now - lastTime.current);

      // Boost velocity proportional to scroll speed
      const scrollSpeed = deltaY / deltaTime;
      velocityRef.current = baseVelocity + scrollSpeed * 2.5;

      lastScrollY.current = currentScrollY;
      lastTime.current = now;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const animate = () => {
      // Smoothly return towards baseVelocity
      velocityRef.current += (baseVelocity - velocityRef.current) * 0.05;

      setOffset((prev) => {
        const next = prev - velocityRef.current;
        // wrap around arbitrarily large boundary
        return next < -2000 ? 0 : next;
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [baseVelocity]);

  // Duplicate text array for infinite seamless wrap
  const repeated = [...texts, ...texts, ...texts, ...texts];

  return (
    <div
      ref={containerRef}
      className={`scroll-velocity-wrapper ${className}`}
      style={{
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '14px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        ...style,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          transform: `translateX(${offset}px)`,
          gap: '32px',
          alignItems: 'center',
          willChange: 'transform',
        }}
      >
        {repeated.map((t, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.86rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: idx % 2 === 0 ? '#FFFFFF' : 'var(--text-tertiary)',
            }}
          >
            <span>{t}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.65rem' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
