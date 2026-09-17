import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal
 * Fluid entrance animation wrapper triggered when elements scroll into the viewport.
 * Supports fade-up, blur-in, zoom, and slide effects with configurable stagger delays.
 */
export default function ScrollReveal({
  children,
  animation = 'fade-up', // 'fade-up' | 'blur-in' | 'zoom' | 'slide-right'
  delay = 0,
  duration = 600,
  threshold = 0.15,
  once = true,
  className = '',
  style = {},
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getTransform = () => {
    if (isVisible) return 'none';
    switch (animation) {
      case 'fade-up':
        return 'translate3d(0, 32px, 0)';
      case 'zoom':
        return 'scale(0.92)';
      case 'slide-right':
        return 'translate3d(-36px, 0, 0)';
      case 'blur-in':
      default:
        return 'translate3d(0, 16px, 0)';
    }
  };

  const getFilter = () => {
    if (isVisible) return 'blur(0px)';
    return animation === 'blur-in' ? 'blur(10px)' : 'none';
  };

  return (
    <div
      ref={ref}
      className={`scroll-reveal-container ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        filter: getFilter(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms ease ${delay}ms`,
        willChange: 'opacity, transform, filter',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
