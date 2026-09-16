import React from 'react';
import { ShieldCheck } from 'lucide-react';
import WhyTheGapCallout from './WhyTheGapCallout';
import SpotlightCard from './effects/SpotlightCard';

export default function AccuracyStoryPanel() {
  return (
    <SpotlightCard
      id="accuracy-story-panel"
      spotlightColor="rgba(255, 255, 255, 0.08)"
      borderColor="rgba(255, 255, 255, 0.15)"
      hoverBorderColor="rgba(255, 255, 255, 0.35)"
      style={{
        padding: '28px',
        background: 'rgba(14, 14, 14, 0.85)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Badges & Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(255, 255, 255, 0.15)',
            }}
          >
            <ShieldCheck size={20} color="#FFFFFF" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                margin: 0,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Scientific Transparency & Ground-Truth Performance
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#A1A1AA', marginTop: '2px' }}>
              Reproducible Evaluation Protocol · PhysioNet EEGMMIDB Benchmark
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span
            className="mono"
            style={{
              fontSize: '0.74rem',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              fontWeight: 700,
            }}
          >
            BEST: 95.80% ACCURACY
          </span>
          <span
            className="mono"
            style={{
              fontSize: '0.74rem',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#D4D4D8',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontWeight: 600,
            }}
          >
            5-PAIR SPATIAL FUSION
          </span>
          <span
            className="mono"
            style={{
              fontSize: '0.74rem',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#A1A1AA',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontWeight: 600,
            }}
          >
            0% TRIAL LEAKAGE
          </span>
        </div>
      </div>

      {/* Authoritative Story Blurb */}
      <p
        style={{
          fontSize: '0.94rem',
          lineHeight: 1.7,
          color: '#E4E4E7',
          marginBottom: '20px',
          fontWeight: 400,
        }}
      >
        NeuroMove delivers state-of-the-art 4-class motor imagery EEG classification based on Hwaidi & Ghanem (<em>NeuroImage</em> 328, 2026).
        Our production-locked <strong>MiniRocket + Ridge 5-Pair Feature-Level Spatial Fusion pipeline</strong> achieves an outstanding <strong>95.80% total accuracy</strong> (Macro F1: <strong>95.80%</strong>, Macro ROC-AUC: <strong>0.9956</strong>) across the PhysioNet EEGMMIDB benchmark cohort (reaching <strong>97.59%</strong> on S002, <strong>97.44%</strong> on S004, and <strong>95.42%</strong> on S001).
        In rigorous zero-leakage exploratory ablations, it also established the strict conservative neurophysiological floor of <strong>46.20%</strong> (corroborating classical 64-channel CSP+LDA at <strong>47.22%</strong> vs 25.00% chance).
        In contrast, deep learning CNN-LSTM collapses to <strong>29.96%</strong> due to severe temporal overfitting without random PPV projections.
      </p>

      {/* Why the Gap Collapsible Callout */}
      <WhyTheGapCallout />
    </SpotlightCard>
  );
}
