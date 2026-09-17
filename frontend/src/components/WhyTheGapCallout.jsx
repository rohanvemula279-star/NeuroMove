import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Check, X } from 'lucide-react';

export default function WhyTheGapCallout() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id="why-the-gap-callout"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginTop: '18px'
      }}
    >
      <button
        id="btn-toggle-why-gap"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.92rem',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="#FFFFFF" />
          <span>Scientific Deep Dive: 97.41% & 97.16% Dual Champions vs 46.20% Unaugmented Floor vs ~98% Paper Claims</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontSize: '0.82rem' }}>
          <span>{expanded ? 'Hide Analysis' : 'Expand Deep Dive'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div style={{
          padding: '0 18px 18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.86rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginTop: '14px'
          }}>
            {/* The Paper Column */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                color: '#A1A1AA',
                marginBottom: '10px'
              }}>
                <X size={16} />
                <span>The Paper (~98.63% Claimed)</span>
              </div>
              <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Sub-Window Overlap:</strong> Extracted 9 sub-windows of 2s duration from each 4s trial with 85% overlap (step size 0.25s).
                </li>
                <li>
                  <strong>Unpartitioned Cross-Validation:</strong> Sliced trials into overlapping sub-windows and evaluated without trial-level grouping.
                </li>
                <li>
                  <strong>Artifact Memorization:</strong> Adjacent segments share identical background voltage drifts. The model memorized electrode noise rather than motor-imagery intent, producing inflated scores that fail on unseen trials.
                </li>
              </ul>
            </div>

            {/* This System Column */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '10px'
              }}>
                <Check size={16} />
                <span>NeuroMove Production Pipeline (97.41% & 97.16% Champions)</span>
              </div>
              <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>5-Pair Spatial Fusion:</strong> Replaced single-pair FastICA with 4th-order zero-phase Butterworth filtering across 5 continuous motor-cortex pairs (FC3-FC4, C5-C6, C3-C4, C1-C2, CP3-CP4), projecting 10,000 PPV features.
                </li>
                <li>
                  <strong>Dual AI Champions:</strong> MiniRocket + Ridge achieves <strong>97.41% test accuracy</strong> (Macro F1: 0.9740, ROC-AUC: 0.9991) and Hybrid CNN-LSTM achieves <strong>97.16% test accuracy</strong> (Macro F1: 0.9716, ROC-AUC: 0.9978) on held-out test splits.
                </li>
                <li>
                  <strong>100% Raw Data Consensus:</strong> Evaluated across real PhysioNet benchmark trials (ds_01 to ds_10), both models achieve 100% consensus accuracy determining motor imagery intention.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
