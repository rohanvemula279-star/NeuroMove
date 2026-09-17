import React, { useState } from 'react';
import { ArrowRight, Activity } from 'lucide-react';


/**
 * CardSwap
 * Interactive 3D stacked card deck.
 * Clicking a card or the next trigger smoothly swaps the top card to the back of the deck with 3D translation & rotation.
 */
export default function CardSwap({
  cards = [
    {
      code: 'T1',
      title: 'T1: Left Fist',
      desc: 'Contralateral C4 electrode sensorimotor desynchronization (Mu 8-12 Hz & Beta 18-30 Hz).',
      metric: '97.9% Precision',
      color: '#38BDF8',
      pair: 'C3 - C4',
    },
    {
      code: 'T2',
      title: 'T2: Right Fist',
      desc: 'Contralateral C3 electrode sensorimotor activation with dominant right-hand lateralization.',
      metric: '98.5% Recall',
      color: '#60A5FA',
      pair: 'C1 - C2',
    },
    {
      code: 'T3',
      title: 'T3: Both Fists',
      desc: 'Bilateral sensorimotor cortex power suppression across differential pre-motor pairs.',
      metric: '98.0% Recall',
      color: '#10B981',
      pair: 'FC3 - FC4',
    },
    {
      code: 'T4',
      title: 'T4: Both Feet',
      desc: 'Medial central Cz / CPz power desynchronization with distinct somatosensory topography.',
      metric: '99.0% Recall',
      color: '#F59E0B',
      pair: 'CP3 - CP4',
    },
  ],

  onCardSelect,
  className = '',
  style = {},
}) {
  const [deck, setDeck] = useState([0, 1, 2, 3]);

  const swapToBack = () => {
    setDeck((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  return (
    <div
      className={`card-swap-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        height: '270px',
        perspective: '1200px',
        userSelect: 'none',
        ...style,
      }}
    >
      {deck.map((cardIdx, stackPos) => {
        const item = cards[cardIdx];
        const isTop = stackPos === 0;

        // Depth styles for stacked cards
        const translateY = stackPos * 14;
        const scale = 1 - stackPos * 0.05;
        const opacity = 1 - stackPos * 0.22;
        const zIndex = 10 - stackPos;

        return (
          <div
            key={item.code}
            onClick={() => {
              if (isTop) {
                swapToBack();
                if (onCardSelect) onCardSelect(item);
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '240px',
              padding: '24px',
              borderRadius: 'var(--radius-md, 14px)',
              background: 'linear-gradient(135deg, rgba(25, 25, 35, 0.95), rgba(12, 12, 18, 0.98))',
              border: `1px solid ${isTop ? item.color : 'rgba(255, 255, 255, 0.12)'}`,
              boxShadow: isTop
                ? `0 16px 36px rgba(0, 0, 0, 0.7), 0 0 24px ${item.color}33`
                : '0 8px 24px rgba(0, 0, 0, 0.5)',
              transform: `translate3d(0, ${translateY}px, ${-stackPos * 40}px) scale(${scale})`,
              opacity,
              zIndex,
              cursor: isTop ? 'pointer' : 'default',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: item.color,
                    color: '#000000',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    padding: '3px 9px',
                    borderRadius: '6px',
                  }}
                >
                  {item.code}
                </span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem' }}>
                  {item.title}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-tertiary)',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Activity size={12} color={item.color} />
                {item.pair}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
              {item.desc}
            </p>

            {/* Card Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: item.color, fontWeight: 700 }}>
                {item.metric}
              </div>
              {isTop && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                  <span>Click to Swap</span>
                  <ArrowRight size={13} color="#FFFFFF" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
