import React, { useId, useState } from 'react';

/**
 * WarpText
 * Liquid / acoustic wave kinetic text warp powered by SVG turbulence and displacement mapping.
 * Simulates neuro-oscillatory wave deformation on hover or idle pulse.
 */
export default function WarpText({
  text = '',
  baseFrequency = '0.02 0.05',
  scale = 12,
  interactive = true,
  className = '',
  style = {},
  tag = 'span',
}) {
  const filterId = useId().replace(/:/g, '');
  const [isHovered, setIsHovered] = useState(false);

  const Tag = tag;

  return (
    <span
      className={`warp-text-container ${className}`}
      style={{ display: 'inline-block', position: 'relative', ...style }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id={`warp-filter-${filterId}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves="2"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="6s"
                values="0.01 0.03; 0.03 0.06; 0.01 0.03"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={isHovered ? scale * 1.5 : scale * 0.4}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <Tag
        style={{
          display: 'inline-block',
          filter: `url(#warp-filter-${filterId})`,
          transition: 'filter 0.3s ease, transform 0.3s ease',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          cursor: interactive ? 'pointer' : 'default',
        }}
      >
        {text}
      </Tag>
    </span>
  );
}
