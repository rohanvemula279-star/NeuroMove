import React from 'react';
import { ExternalLink, Code2, Brain, Activity, Cpu, Sparkles, Layers } from 'lucide-react';
import SpotlightCard from './effects/SpotlightCard';

/**
 * GithubIcon
 * Self-contained SVG icon matching the Feather/Lucide design system.
 */
function GithubIcon({ size = 15, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

/**
 * TeamSection
 * Highlights the core research and engineering contributors behind NeuroMove 2.0.
 * Displays GitHub handles, roles, and concrete codebase contributions.
 */
export default function TeamSection() {
  const contributors = [
    {
      name: 'Rohan Vemula',
      handle: 'rohanvemula279-star',
      role: 'Project Lead & System Architect',
      githubUrl: 'https://github.com/rohanvemula279-star',
      avatarUrl: 'https://github.com/rohanvemula279-star.png',
      badge: 'Core Maintainer',
      badgeColor: '#10B981',
      icon: Cpu,
      contributions: [
        'Designed end-to-end NeuroMove 2.0 dual-champion architecture',
        'Engineered zero-leakage continuous trial CV framework (scripts/train_v2.py)',
        'Built 29-test automated pytest verification suite across PhysioNet cohort',
      ],
      tags: ['System Architecture', 'Cross-Validation', 'Full Stack', 'Verification'],
    },
    {
      name: 'Sudhasri A',
      handle: 'SudhasriA',
      role: 'ML Engineer — Spatial Fusion & MiniRocket',
      githubUrl: 'https://github.com/SudhasriA',
      avatarUrl: 'https://github.com/SudhasriA.png',
      badge: 'Champion Model #1',
      badgeColor: '#34D399',
      icon: Brain,
      contributions: [
        'Engineered 5-pair motor cortex MiniRocket spatial fusion (app/models/minirocket_pipeline.py)',
        'Integrated 10,000 PPV kernel transforms with sub-10ms (7.06ms) inference latency',
        'Tuned closed-form RidgeClassifierCV achieving 97.41% test accuracy',
      ],
      tags: ['MiniRocket', 'RidgeClassifierCV', 'Feature Extraction', 'Ablations'],
    },
    {
      name: 'Nakshathra V',
      handle: 'nakshathrav2007-hash',
      role: 'Deep Learning Architect — CNN-LSTM',
      githubUrl: 'https://github.com/nakshathrav2007-hash',
      avatarUrl: 'https://github.com/nakshathrav2007-hash.png',
      badge: 'Champion Model #2',
      badgeColor: '#38BDF8',
      icon: Sparkles,
      contributions: [
        'Designed spatio-temporal deep neural network (app/models/cnn_lstm.py)',
        'Synthesized multi-scale 1D temporal convolutions with Bidirectional LSTM',
        'Implemented dynamic ReduceLROnPlateau scheduling reaching 97.16% test accuracy',
      ],
      tags: ['PyTorch / Keras', 'BiLSTM', 'Spatio-Temporal', 'Deep Learning'],
    },
    {
      name: 'Akshitha Reddy',
      handle: 'akshithareddy025-jpg',
      role: 'Biomedical Signal Processing Specialist',
      githubUrl: 'https://github.com/akshithareddy025-jpg',
      avatarUrl: 'https://github.com/akshithareddy025-jpg.png',
      badge: 'Neurophysiology DSP',
      badgeColor: '#F59E0B',
      icon: Activity,
      contributions: [
        'Zero-phase 4th-order Butterworth bandpass filter for 8–30 Hz μ/β rhythm (app/data/preprocessing.py)',
        'Common Average Referencing (CAR) & anti-aliasing downsampling (160 Hz -> 128 Hz)',
        'Multi-format EEG ingestion (.edf, .npy, .csv) with zero trial leakage (app/data/loader.py)',
      ],
      tags: ['Butterworth Filters', 'CAR Referencing', 'EDF Ingestion', 'SciPy DSP'],
    },
    {
      name: 'Sahasra Marikanti',
      handle: 'sahasramarikanti-cpu',
      role: 'Full-Stack BCI Systems & Visualization Lead',
      githubUrl: 'https://github.com/sahasramarikanti-cpu',
      avatarUrl: 'https://github.com/sahasramarikanti-cpu.png',
      badge: 'Streaming & UI',
      badgeColor: '#A855F7',
      icon: Layers,
      contributions: [
        'Engineered FastAPI 2.0 WebSocket telemetry streaming server (app/routers/stream.py)',
        'Built Sentinel scientific UI with live dual-waveform oscilloscope (frontend/src/)',
        'Developed interactive 4-class confusion matrix heatmaps & multi-class ROC-AUC charts',
      ],
      tags: ['FastAPI Telemetry', 'WebSockets', 'React 19', 'Signal Oscilloscope'],
    },
  ];

  return (
    <section className="team-section" style={{ margin: '48px 0' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div style={{ maxWidth: '720px' }}>
          <span
            className="mono"
            style={{
              fontSize: '0.74rem',
              color: '#10B981',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Code2 size={13} />
            Research Team & Open-Source Contributors
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              margin: '10px 0 12px 0',
              lineHeight: 1.2,
            }}
          >
            The Minds Behind NeuroMove 2.0
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.6, margin: 0 }}>
            Meet the engineers and neuroimaging researchers who formulated the dual-champion motor imagery decoders,
            zero-phase DSP pipelines, and real-time telemetry architecture.
          </p>
        </div>

        <a
          href="https://github.com/rohanvemula279-star/NeuroMove/blob/main/CONTRIBUTORS.md"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <GithubIcon size={15} color="#FFFFFF" />
          <span>View CONTRIBUTORS.md</span>
          <ExternalLink size={12} color="#A1A1AA" />
        </a>
      </div>

      {/* Contributors Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {contributors.map((member) => {
          const Icon = member.icon;
          return (
            <SpotlightCard
              key={member.handle}
              spotlightColor="rgba(255, 255, 255, 0.08)"
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '18px',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                {/* Header: Avatar, Names, Role Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=18181b&color=ffffff&bold=true`;
                        }}
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#09090B',
                          border: `1px solid ${member.badgeColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={11} color={member.badgeColor} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                          {member.name}
                        </h3>
                      </div>
                      <a
                        href={member.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono"
                        style={{
                          fontSize: '0.78rem',
                          color: '#A1A1AA',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1AA')}
                      >
                        @{member.handle}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>

                  <span
                    className="mono"
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: member.badgeColor,
                      border: `1px solid ${member.badgeColor}40`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {member.badge}
                  </span>
                </div>

                {/* Role Title */}
                <div
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#E4E4E7',
                    marginBottom: '14px',
                  }}
                >
                  {member.role}
                </div>

                {/* Specific Contributions */}
                <div style={{ marginBottom: '18px' }}>
                  <div
                    className="mono"
                    style={{
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text-tertiary)',
                      marginBottom: '8px',
                      fontWeight: 700,
                    }}
                  >
                    Key Subsystem Contributions:
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '7px',
                    }}
                  >
                    {member.contributions.map((c, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          fontSize: '0.81rem',
                          lineHeight: 1.45,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: member.badgeColor,
                            marginTop: '6px',
                            flexShrink: 0,
                          }}
                        />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom: Tags & Profile Link */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    paddingTop: '14px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '14px',
                  }}
                >
                  {member.tags.map((tag) => (
                    <span
                      key={tag}
                      className="mono"
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: '#A1A1AA',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                  }}
                >
                  <GithubIcon size={14} color="#FFFFFF" />
                  <span>GitHub Profile</span>
                </a>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
