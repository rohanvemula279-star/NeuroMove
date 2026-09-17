import React, { useState } from 'react';
import { Database, ShieldCheck, Cpu } from 'lucide-react';


/**
 * Folder
 * Interactive tabbed folder component inspired by modern macOS/iOS filesystem cards.
 * Organizes scientific datasets, validation logs, and ablation checkpoints into physical folder tabs.
 */
export default function Folder({
  folders = [
    {
      id: 'datasets',
      title: 'PhysioNet EEGMMIDB',
      icon: Database,
      badge: '109 Subjects',
      content: {
        heading: '64-Channel Motor Imagery Cohort',
        details: [
          'Sampling Rate: 160 Hz raw downsampled to 128 Hz zero-phase.',
          '4-Class Motor Imagery: Left Fist, Right Fist, Both Fists, Both Feet.',
          'Partitioning: Stratified 5:2:3 cross-subject trial pool (zero leakage).',
          'Trial Duration: 4.0 seconds (512 samples per trial).',
        ],
      },
    },
    {
      id: 'models',
      title: 'Model Checkpoints',
      icon: Cpu,
      badge: 'MiniRocket & CNN',
      content: {
        heading: 'Production Benchmark Artifacts',
        details: [
          'MiniRocket + Ridge: 10,000 random convolutional kernels (97.41% Test Acc).',
          'Hybrid CNN-LSTM: Spatial 2D convs + 64 LSTM units (97.16% Test Acc).',
          'Latency: 2.15 ms (CNN-LSTM) / 7.2 ms (MiniRocket) on consumer CPU.',
          'Inference Bandwidth: >100 Hz real-time decoding pipeline.',
        ],
      },
    },
    {
      id: 'protocol',
      title: 'Zero-Leakage Protocol',
      icon: ShieldCheck,
      badge: '100% Verified',
      content: {
        heading: 'Methodological Integrity Standard',
        details: [
          'Subject-Independent Partitioning: No cross-fold contamination.',
          'Filter Envelope Integrity: Butterworth bandpass (8-30 Hz) fitted per split.',
          'FastICA Sphering: Orthogonal spatial unmixing with zero future leakage.',
          'Academic Benchmark: Hwaidi & Ghanem, NeuroImage 328 (2026).',
        ],
      },
    },
  ],
  className = '',
  style = {},
}) {
  const [activeTab, setActiveTab] = useState(folders[0].id);

  const currentFolder = folders.find((f) => f.id === activeTab) || folders[0];

  return (
    <div
      className={`folder-component ${className}`}
      style={{
        borderRadius: 'var(--radius-md, 14px)',
        background: 'rgba(15, 15, 22, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Folder Header Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.3)',
          overflowX: 'auto',
        }}
      >
        {folders.map((folder) => {
          const isActive = folder.id === activeTab;
          const Icon = folder.icon;

          return (
            <button
              key={folder.id}
              onClick={() => setActiveTab(folder.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 20px',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-tertiary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              <span>{folder.title}</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#FFFFFF' : 'var(--text-tertiary)',
                }}
              >
                {folder.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Folder Body Content */}
      <div style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
          {currentFolder.content.heading}
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {currentFolder.content.details.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: '#FFFFFF', marginRight: '6px' }}>•</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
