import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * ScrollExpand
 * Viewport/scroll-linked showcase container that expands into full focus.
 * Inspired by React Bits scroll-linked expanding frames, perfect for showcasing the live BCI oscilloscope.
 */
export default function ScrollExpand({
  children,
  defaultExpanded = false,
  minWidth = '92%',
  maxWidth = '100%',
  title = 'Real-Time Neural Oscilloscope',
  badge = 'LIVE 128 HZ',
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isExpanded) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // When the top of the component reaches middle of viewport, expand smoothly
      if (rect.top <= windowHeight * 0.65 && rect.bottom >= windowHeight * 0.2) {
        setIsExpanded(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  return (
    <div
      ref={containerRef}
      className={`scroll-expand-container ${isExpanded ? 'is-expanded' : ''}`}
      style={{
        width: isExpanded ? maxWidth : minWidth,
        margin: '0 auto',
        transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
        borderRadius: isExpanded ? '24px' : '16px',
        overflow: 'hidden',
        background: 'rgba(14, 14, 14, 0.85)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: isExpanded
          ? '0 30px 80px -15px rgba(0, 0, 0, 0.9), 0 0 40px -10px rgba(255, 255, 255, 0.08)'
          : '0 12px 36px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Editorial Bar Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            }}
          />
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#FFFFFF' }}>{title}</span>
          <span
            className="mono"
            style={{
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontWeight: 600,
            }}
          >
            {badge}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'color 0.2s ease, background 0.2s ease',
          }}
          title={isExpanded ? 'Collapse Frame' : 'Expand Frame'}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          <span>{isExpanded ? 'Standard View' : 'Focus Mode'}</span>
        </button>
      </div>

      {/* Frame Content */}
      <div style={{ padding: isExpanded ? '24px' : '16px', transition: 'padding 0.4s ease' }}>
        {children}
      </div>
    </div>
  );
}
