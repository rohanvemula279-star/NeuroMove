import React, { useState, useEffect, useRef } from 'react';

/**
 * SplitText
 * Kinetic staggered character/word reveal animation inspired by React Bits.
 * Splits incoming text into animated spans with smooth physics easing.
 */
export default function SplitText({
  text = '',
  className = '',
  style = {},
  delay = 25, // ms per char
  splitBy = 'chars', // 'chars' | 'words'
  tag: Tag = 'h1',
}) {
  const [isVisible, setIsVisible] = useState(true);
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (splitBy === 'words') {
    const words = text.split(' ');
    return (
      <Tag ref={elementRef} className={`split-text-wrapper ${className}`} style={{ display: 'inline-block', ...style }}>
        {words.map((word, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.28em',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
              transitionDelay: `${i * delay * 2}ms`,
            }}
          >
            {word}
          </span>
        ))}
      </Tag>
    );
  }

  // Split by characters
  const characters = text.split('');
  return (
    <Tag ref={elementRef} className={`split-text-wrapper ${className}`} style={{ display: 'inline-block', ...style }}>
      {characters.map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)`,
            transitionDelay: `${i * delay}ms`,
          }}
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}
