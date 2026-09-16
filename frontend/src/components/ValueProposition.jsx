import React from 'react';
import { Activity, Zap, ShieldCheck } from 'lucide-react';
import SpotlightCard from './effects/SpotlightCard';

/**
 * ValueProposition
 * Section: Total visibility across your entire neural infrastructure
 * Features 3 modular capability blocks matching Sentinel structure.
 */
export default function ValueProposition() {
  const features = [
    {
      tag: 'Detection · Motor Cortex Core',
      title: 'Unified signal, zero noise',
      description:
        '5-pair differential montage (C3-C4, C1-C2, FC3-FC4, CP3-CP4, C5-C6) correlated into one feature matrix — isolating 8–30 Hz sensorimotor desynchronization (ERD/ERS) with zero sub-window leakage.',
      icon: Activity,
      accent: '#FFFFFF',
    },
    {
      tag: 'Response · MiniRocket Ridge Flow',
      title: 'Response in 6.1 milliseconds',
      description:
        'Closed-form Ridge solver evaluates 10,000 random convolutional kernels in sub-10ms, eliminating sensory latency to enable ~163 Hz continuous closed-loop robotic and prosthetic actuation.',
      icon: Zap,
      accent: '#D4D4D8',
    },
    {
      tag: 'Governance · Zero-Leakage Protocol',
      title: 'Provable, sealed control',
      description:
        '10-fold stratified cross-validation locks strict patient and trial boundaries, corroborating the 46.20% neurophysiological floor and preventing artificial split-window score inflation.',
      icon: ShieldCheck,
      accent: '#A1A1AA',
    },
  ];

  return (
    <section className="value-proposition-section" style={{ margin: '64px 0' }}>
      <div style={{ maxWidth: '820px', marginBottom: '36px' }}>
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
          Core Architecture
        </span>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            margin: '8px 0 16px 0',
            lineHeight: 1.15,
          }}
        >
          Total visibility across your entire neural infrastructure
        </h2>
        <p style={{ fontSize: '1.02rem', color: '#A1A1AA', lineHeight: 1.65, margin: 0 }}>
          One platform that sees, filters, and decodes every motor intention. NeuroMove collapses the traditional
          multi-stage EEG preprocessing pipeline into a single, closed-form system of record — built to detect,
          respond, and prove clinical validity without the computational tax.
        </p>
      </div>

      <div
        className="features-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {features.map((feat, index) => {
          const IconComp = feat.icon;
          return (
            <SpotlightCard
              key={index}
              spotlightColor="rgba(255, 255, 255, 0.08)"
              borderColor="rgba(255, 255, 255, 0.1)"
              hoverBorderColor="rgba(255, 255, 255, 0.35)"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComp size={18} color="#FFFFFF" />
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: '0.68rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  >
                    {feat.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: '0 0 10px 0',
                    letterSpacing: '-0.015em',
                  }}
                >
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#A1A1AA', lineHeight: 1.6, margin: 0 }}>
                  {feat.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.74rem',
                  color: 'var(--text-tertiary)',
                }}
              >
                PROD-VERIFIED · EEGMMIDB BENCHMARK
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
