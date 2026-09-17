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
              97.41% ACCURACY
            </span>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '8px 0' }}>
            Production spatial fusion champion. Utilizes 4th-order zero-phase Butterworth filtering across 5 continuous motor-cortex bipolar pairs (C3-C4, C1-C2, FC3-FC4, CP3-CP4, C5-C6) with 10,000 PPV convolutional projections.
            Achieves <strong>97.41% test accuracy</strong> across Person-1 through Person-5.
          </p>

          <div style={{ display: 'flex', gap: '18px', fontSize: '0.8rem', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Test Accuracy: </span>
              <span className="mono" style={{ color: '#FFFFFF', fontWeight: 700 }}>97.41%</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Macro F1: </span>
              <span className="mono" style={{ color: '#FFFFFF', fontWeight: 700 }}>0.9740</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Latency: </span>
              <span className="mono" style={{ color: '#E4E4E7', fontWeight: 700 }}>7.2 ms/sample</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Parameters: </span>
              <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>40,004</span>
            </div>
          </div>
        </div>

        {/* Model 2: CNN-LSTM Hybrid Champion */}
        <div
          id="model-option-cnn_lstm"
          onClick={() => onSelectModel('cnn_lstm')}
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${selectedModel === 'cnn_lstm' ? '#FFFFFF' : 'var(--glass-border)'}`,
            background: selectedModel === 'cnn_lstm' ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-surface-0)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Layers size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Hybrid CNN-LSTM Spatio-Temporal</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    CO-CHAMPION
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Spatial Conv2D · Temporal Bidirectional LSTM · Multi-Head Attention
                </div>
              </div>
            </div>

            <span className="badge badge-cyan" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
              <CheckCircle size={11} />
              97.16% ACCURACY
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '8px 0' }}>
            Re-engineered deep learning architecture combining spatial convolutions, bidirectional LSTM temporal modeling, and attention pooling. Resolves temporal overfitting to achieve <strong>97.16% test accuracy</strong> with ultra-fast <strong>2.15 ms</strong> inference.
          </p>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Test Accuracy: </span>
              <span className="mono" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>97.16%</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Macro F1: </span>
              <span className="mono" style={{ color: '#FFFFFF', fontWeight: 600 }}>0.9716</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Latency: </span>
              <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>2.15 ms/sample</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Throughput: </span>
              <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>&gt;400 Hz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
