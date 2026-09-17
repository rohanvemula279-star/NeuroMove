import React, { useEffect, useRef, useState } from 'react';

/**
 * BlurText
 * Staggered blur-to-sharp animation inspired by modern ReactBits typography.
 * Animates characters or words from gaussian blur + vertical offset to crisp focus upon entering viewport.
 */
export default function BlurText({
  text = '',
  delay = 50,
  animateBy = 'words', // 'words' | 'letters'
  direction = 'top', // 'top' | 'bottom'
  threshold = 0.1,
  rootMargin = '0px',
  className = '',
  style = {},
  onAnimationComplete,
}) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const initialY = direction === 'top' ? -18 : 18;

  return (
    <span
      ref={ref}
      className={`blur-text-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: animateBy === 'words' ? '0.3em' : '0.04em',
        ...style,
      }}
    >
      {elements.map((el, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            filter: inView ? 'blur(0px)' : 'blur(12px)',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : `translateY(${initialY}px)`,
            transition: `filter 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${i * delay}ms, opacity 0.65s ease-out ${i * delay}ms, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${i * delay}ms`,
            willChange: 'filter, opacity, transform',
          }}
          onTransitionEnd={
            i === elements.length - 1 ? onAnimationComplete : undefined
          }
        >
          {el === ' ' ? '\u00A0' : el}
        </span>
      ))}
    </span>
  );
}
