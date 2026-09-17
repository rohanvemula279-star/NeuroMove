import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap, Layers, ChevronRight } from 'lucide-react';

/**
 * AccordionGallery
 * Horizontal expanding accordion gallery showcasing the 5 differential electrode pairs and frequency bands.
 * Hovering or clicking any panel expands it smoothly while compressing adjacent panels.
 */
export default function AccordionGallery({
  items = [
    {
      id: 'pair1',
      title: 'C3 - C4',
      subtitle: 'Primary Hand SMR',
      band: 'Mu Band (8–12 Hz)',
      desc: 'Central sensorimotor hand knob differential pair. Captures lateralized event-related desynchronization (ERD).',
      metric: '0.94 F1-Score',
      color: '#38BDF8',
      freqRange: '8.0 - 12.0 Hz',
    },
    {
      id: 'pair2',
      title: 'FC3 - FC4',
      subtitle: 'Pre-Motor Spatial Field',
      band: 'Motor Planning (10–14 Hz)',
      desc: 'Anterior pre-motor electrodes providing anticipatory phase dynamics prior to motor imagery execution.',
      metric: '0.96 F1-Score',
      color: '#60A5FA',
      freqRange: '10.0 - 14.0 Hz',
    },
    {
      id: 'pair3',
      title: 'C1 - C2',
      subtitle: 'Focused Rolandic Gyri',
      band: 'High-Beta (18–24 Hz)',
      desc: 'Tight inter-electrode spacing delivering superior spatial gradient resolution with minimal volume conduction.',
      metric: '0.98 F1-Score',
      color: '#10B981',
      freqRange: '18.0 - 24.0 Hz',
    },
    {
      id: 'pair4',
      title: 'CP3 - CP4',
      subtitle: 'Somatosensory Feedback',
      band: 'Post-Movement Beta (20–30 Hz)',
      desc: 'Parietal sensory integration channels sensitive to afferent motor inhibition and foot imagery.',
      metric: '0.97 F1-Score',
      color: '#34D399',
      freqRange: '20.0 - 30.0 Hz',
    },
    {
      id: 'pair5',
      title: 'C5 - C6',
      subtitle: 'Lateral Temporal Flank',
      band: 'SMR Lateral Flank (8–30 Hz)',
      desc: 'Wide lateral differential pair establishing global common-mode reference rejection.',
      metric: '0.95 F1-Score',
      color: '#F43F5E',
      freqRange: '8.0 - 30.0 Hz',
    },
  ],
  className = '',
  style = {},
}) {
  const [activeId, setActiveId] = useState(items[0].id);

  return (
    <div
      className={`accordion-gallery ${className}`}
      style={{
        display: 'flex',
        gap: '12px',
        width: '100%',
        minHeight: '260px',
        userSelect: 'none',
        ...style,
      }}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;

        return (
          <div
            key={item.id}
            onClick={() => setActiveId(item.id)}
            onMouseEnter={() => setActiveId(item.id)}
            style={{
              flex: isActive ? '3.5' : '1',
              minWidth: '70px',
              borderRadius: 'var(--radius-md, 12px)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(28, 28, 38, 0.95), rgba(16, 16, 24, 0.98))'
                : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${isActive ? item.color : 'rgba(255, 255, 255, 0.08)'}`,
              boxShadow: isActive ? `0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${item.color}22` : 'none',
              padding: '18px',
              cursor: 'pointer',
              transition: 'flex 0.45s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, border-color 0.3s ease',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            {/* Top Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: item.color,
                    boxShadow: isActive ? `0 0 10px ${item.color}` : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.title}
                </span>
              </div>
              {isActive && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: item.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.band}
                </span>
              )}
            </div>

            {/* Middle Expanded Details */}
            {isActive ? (
              <div style={{ margin: '14px 0' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {item.subtitle}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ) : (
              <div
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: '0.74rem',
                  color: 'var(--text-tertiary)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  margin: 'auto 0',
                }}
              >
                {item.subtitle}
              </div>
            )}

            {/* Bottom Metrics Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: isActive ? item.color : 'var(--text-tertiary)', fontWeight: 700 }}>
                {item.freqRange}
              </span>
              {isActive && (
                <span style={{ fontSize: '0.74rem', color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.metric}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
