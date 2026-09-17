import React, { useEffect, useRef, useState } from 'react';

/**
 * CountUp
 * Smooth numerical ease-out count-up animation that triggers when entering viewport.
 * Supports decimals, prefix, suffix, and custom easing durations.
 */
export default function CountUp({
  to = 100,
  from = 0,
  duration = 1800,
  decimals = 0,
  prefix = '',
  suffix = '',
  threshold = 0.2,
  className = '',
  style = {},
}) {
  const [val, setVal] = useState(from);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const startTime = performance.now();

          const step = (now) => {
            const progress = Math.min(1, (now - startTime) / duration);
            // Quartic ease-out: 1 - (1 - t)^4
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentVal = from + (to - from) * easeProgress;
            setVal(currentVal);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setVal(to);
            }
          };

          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, from, duration, threshold]);

  return (
    <span ref={ref} className={`count-up-value ${className}`} style={{ ...style }}>
      {prefix}
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}
      {suffix}
    </span>
  );
}
