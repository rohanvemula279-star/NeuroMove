import React from 'react';

/**
 * AnimatedList
 * Kinetic staggered animated list for live inference events, subject rankings, and dataset lists.
 */
export default function AnimatedList({
  children,
  staggerMs = 50,
  className = '',
  style = {},
}) {
  const childArray = React.Children.toArray(children);

  return (
    <div
      className={`animated-list-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        ...style,
      }}
    >
      {childArray.map((child, index) => (
        <div
          key={index}
          style={{
            animation: `fade-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms forwards`,
            opacity: 0,
            transform: 'translateY(12px)',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
