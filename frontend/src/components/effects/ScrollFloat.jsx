import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollFloat
 * Parallax floating kinetic container that drifts with inertia on scroll.
 */
export default function ScrollFloat({
  children,
  speed = 0.15,
  direction = 'up', // 'up' | 'down'
  className = '',
  style = {},
}) {
  const [offsetY, setOffsetY] = useState(0);
  const elRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!elRef.current) return;
      const rect = elRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const diff = elementCenter - viewportCenter;

      const factor = direction === 'up' ? -speed : speed;
      setOffsetY(diff * factor);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [speed, direction]);


  return (
    <div
      ref={elRef}
      className={`scroll-float-box ${className}`}
      style={{
        transform: `translate3d(0, ${offsetY}px, 0)`,
        transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
