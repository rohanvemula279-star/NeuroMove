import React from 'react';
import { Cpu, CheckCircle, AlertTriangle, Zap, Layers } from 'lucide-react';

export default function ModelSelector({ selectedModel, onSelectModel }) {
  return (
    <div className="card" id="model-selector" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Cpu size={20} color="#FFFFFF" />
            Classifier Model Architecture
          </h2>
          <p className="card-subtitle">
            Select the inference pipeline to classify motor imagery intent
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Model 1: MiniRocket (Best Model / Production Validated) */}
        <div
          id="model-option-minirocket"
          onClick={() => onSelectModel('minirocket')}
          style={{
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${selectedModel === 'minirocket' ? '#FFFFFF' : 'var(--glass-border)'}`,
            background: selectedModel === 'minirocket' ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-surface-0)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>MiniRocket + Ridge (5-Pair Spatial Fusion)</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    BEST MODEL
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Butterworth 8–30 Hz Bandpass · 10,000 PPV Features · 5 Motor Cortex Pairs
                </div>
              </div>
            </div>

            <span className="badge badge-emerald" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
              <CheckCircle size={12} />
              95.80% ACCURACY
            </span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '8px 0' }}>
            The top-performing production model. Utilizes 4th-order zero-phase Butterworth filtering and 5 symmetric motor-cortex feature pairs (FC3-FC4, C5-C6, C3-C4, C1-C2, CP3-CP4).
            Achieves <strong>95.80% overall accuracy</strong> (reaching <strong>97.59%</strong> on S002 and <strong>97.44%</strong> on S004).
          </p>

          <div style={{ display: 'flex', gap: '18px', fontSize: '0.8rem', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Total Accuracy: </span>
              <span className="mono" style={{ color: '#FFFFFF', fontWeight: 700 }}>95.80%</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Macro F1: </span>
              <span className="mono" style={{ color: '#FFFFFF', fontWeight: 700 }}>95.80%</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Latency: </span>
              <span className="mono" style={{ color: '#E4E4E7', fontWeight: 700 }}>6.1 ms/sample</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Parameters: </span>
              <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>20,004</span>
            </div>
          </div>
        </div>

        {/* Model 2: CNN-LSTM (Experimental / Baseline) */}
        <div
          id="model-option-cnn_lstm"
          onClick={() => onSelectModel('cnn_lstm')}
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${selectedModel === 'cnn_lstm' ? '#A1A1AA' : 'var(--glass-border)'}`,
            background: selectedModel === 'cnn_lstm' ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-surface-0)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: selectedModel === 'cnn_lstm' ? 1 : 0.8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Layers size={18} color="#D4D4D8" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                  13-Layer CNN-LSTM Hybrid
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Deep Spatio-Temporal Hybrid (Paper Table 1)
                </div>
              </div>
            </div>

            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
              <AlertTriangle size={11} />
              EXPERIMENTAL · 29.96% ACC
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '8px 0' }}>
            Exact 13-layer deep learning architecture from the paper. Due to parameter complexity without random PPV projections, it experiences severe overfitting on raw spatio-temporal channels (<strong>29.96%</strong> 10-fold CV accuracy vs 25% chance).
          </p>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Accuracy: </span>
              <span className="mono" style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>29.96%</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Latency: </span>
              <span className="mono" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>18.2 ms/sample</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Parameters: </span>
              <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>~182,400</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
