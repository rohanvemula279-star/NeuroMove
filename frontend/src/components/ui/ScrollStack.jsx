import React from 'react';

/**
 * ScrollStack
 * Sticky stacking container.
 * As user scrolls down, child cards stick to the top and stack over one another
 * with subtle scale and shadow depth.
 */
export default function ScrollStack({
  children,
  offset = 80,
  itemHeight = 'auto',
  className = '',
  style = {},
}) {
  const childArray = React.Children.toArray(children);

  return (
    <div
      className={`scroll-stack-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        ...style,
      }}
    >
      {childArray.map((child, index) => (
        <div
          key={index}
          className="scroll-stack-card"
          style={{
            position: 'sticky',
            top: `${offset + index * 16}px`,
            zIndex: index + 1,
            height: itemHeight,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
