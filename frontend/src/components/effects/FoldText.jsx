import React, { useState } from 'react';

/**
 * FoldText
 * 3D perspective letter fold/flip effect inspired by React Bits typography components.
 * Flips/folds characters with 3D perspective on mount or hover.
 */
export default function FoldText({
  text = '',
  className = '',
  style = {},
  perspective = '800px',
  foldColor = '#00F0FF',
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`fold-text-container ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        perspective,
        cursor: 'default',
        ...style,
      }}
    >
      {text.split('').map((char, index) => {
        const isSpace = char === ' ';
        return (
          <span
            key={index}
            className="fold-char"
            style={{
              display: 'inline-block',
              whiteSpace: isSpace ? 'pre' : 'normal',
              transformStyle: 'preserve-3d',
              transition: `transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease`,
              transitionDelay: `${index * 25}ms`,
              transform: isHovered
                ? `rotateX(360deg) translateY(-2px)`
                : 'rotateX(0deg) translateY(0)',
              color: isHovered ? foldColor : 'inherit',
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
