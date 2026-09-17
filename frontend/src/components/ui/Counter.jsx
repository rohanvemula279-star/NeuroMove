import React from 'react';

/**
 * Counter
 * Mechanical rolling odometer digit counter.
 * Each digit rotates vertically to its target value with smooth easing.
 */
export default function Counter({
  value = 97.41,
  decimals = 2,
  prefix = '',
  suffix = '%',
  className = '',
  style = {},
}) {
  const formattedStr = Number(value).toFixed(decimals);
  const chars = formattedStr.split('');

  return (
    <div
      className={`odometer-counter ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontFamily: 'monospace',
        fontWeight: 800,
        overflow: 'hidden',
        lineHeight: 1,
        ...style,
      }}
    >
      {prefix && <span>{prefix}</span>}
      {chars.map((char, index) => {
        const isDigit = /\d/.test(char);
        if (!isDigit) {
          return <span key={index} style={{ padding: '0 2px' }}>{char}</span>;
        }

        const digitVal = parseInt(char, 10);

        return (
          <div
            key={index}
            style={{
              height: '1.15em',
              overflow: 'hidden',
              display: 'inline-block',
              position: 'relative',
              width: '0.62em',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(-${digitVal * 10}%)`,
                transition: `transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms`,
                willChange: 'transform',
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <span
                  key={num}
                  style={{
                    height: '1.15em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      {suffix && <span>{suffix}</span>}
    </div>
  );
}
