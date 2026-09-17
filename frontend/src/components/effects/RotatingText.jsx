import React, { useEffect, useState } from 'react';

/**
 * RotatingText
 * Vertical 3D kinetic text flipper cycling through array of terms.
 * Perfect for dynamic hero highlights, model specs, and real-time indicators.
 */
export default function RotatingText({
  texts = [
    '97.41% MiniRocket Accuracy',
    'Zero-Leakage Stratified Protocol',
    '2.15ms Ultra-Low Latency',
    '5-Pair Sensorimotor Fusion',
    '64-Channel PhysioNet Cohort',
  ],
  interval = 2800,
  className = '',
  style = {},
  highlightColor = '#FFFFFF',
}) {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % texts.length);
        setIsFlipping(false);
      }, 320);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <span
      className={`rotating-text-box ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        perspective: '1000px',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          color: highlightColor,
          fontWeight: 700,
          transform: isFlipping ? 'rotateX(90deg) translateY(-8px)' : 'rotateX(0deg) translateY(0)',
          opacity: isFlipping ? 0 : 1,
          filter: isFlipping ? 'blur(4px)' : 'blur(0)',
          transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease, filter 0.28s ease',
          willChange: 'transform, opacity, filter',
        }}
      >
        {texts[index]}
      </span>
    </span>
  );
}
