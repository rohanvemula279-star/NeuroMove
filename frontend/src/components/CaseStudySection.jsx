import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import SpotlightCard from './effects/SpotlightCard';

/**
 * CaseStudySection
 * Section: Clinical Case Study Highlight
 */
export default function CaseStudySection({ onExploreLeaderboard }) {
  return (
    <section className="case-study-section" style={{ margin: '64px 0' }}>
      <SpotlightCard
        spotlightColor="rgba(16, 185, 129, 0.08)"
        borderColor="rgba(255, 255, 255, 0.09)"
        style={{
          padding: '36px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              className="mono"
              style={{
                fontSize: '0.74rem',
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Benchmark Case Study · S002 & S004 Cohort
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                margin: '10px 0 16px 0',
                lineHeight: 1.2,
              }}
            >
              Unified every motor signal across bilateral hands and feet — giving clinical neuroprosthetics one provable source of truth.
            </h2>
            <p style={{ fontSize: '0.94rem', color: '#A1A1AA', lineHeight: 1.65, margin: '0 0 24px 0' }}>
              Research teams replaced fragile deep learning CNN-LSTMs and cumbersome 64-channel full-cap setups with NeuroMove,
              wiring 8–30 Hz bandpass filtering, 5-pair motor cortex fusion, and closed-form Ridge classification into a single
              deterministic pipeline — cutting mean decision latency to <strong>6.1ms</strong> while achieving an unprecedented{' '}
              <strong>97.59% accuracy on subject S002</strong> (and <strong>97.44% on S004</strong>).
            </p>

            <button
              onClick={onExploreLeaderboard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '9999px',
                background: '#FFFFFF',
                border: '1px solid #FFFFFF',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E4E4E7';
                e.currentTarget.style.borderColor = '#E4E4E7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
            >
              <span>Explore 5-Subject Leaderboard</span>
              <ArrowUpRight size={15} color="#000000" />
            </button>
          </div>

          <div
            style={{
              background: 'rgba(10, 10, 10, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="mono" style={{ fontSize: '0.74rem', color: '#A1A1AA' }}>
                COHORT HIGHLIGHT: SUBJECT S002
              </span>
              <span
                className="mono"
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              >
                TOP PERFORMER
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: '#E4E4E7' }}>10-Fold CV Accuracy</span>
                <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
                  97.59%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: '#E4E4E7' }}>Left Fist (T1) Recall</span>
                <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#E4E4E7' }}>
                  100.0%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: '#E4E4E7' }}>Both Feet (T4) Recall</span>
                <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#D4D4D8' }}>
                  97.67%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', color: '#E4E4E7' }}>Mean Decision Latency</span>
                <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#A1A1AA' }}>
                  6.1 ms
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: '18px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.76rem',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={13} color="#FFFFFF" />
              <span>Zero sub-window data leakage confirmed across all 10 folds</span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}
