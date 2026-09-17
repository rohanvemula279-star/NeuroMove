import React from 'react';
import { Play, ShieldCheck, Cpu, ArrowUpRight, Activity, Zap } from 'lucide-react';
import SplitText from './effects/SplitText';
import FoldText from './effects/FoldText';
import WrapText from './effects/WrapText';
import StarBorder from './effects/StarBorder';
import LineWaves from './effects/LineWaves';
import ScrollExpand from './effects/ScrollExpand';

export default function HeroSection({
  onLaunchLive,
  onViewBenchmarks,
  backendStatus,
  currentTrial,
}) {
  const specs = [
    { label: '97.41% & 97.16% ACCURACY', icon: <ShieldCheck size={13} color="#FFFFFF" /> },
    { label: '0% TRIAL LEAKAGE', icon: <Cpu size={13} color="#D4D4D8" /> },
    { label: '5-PAIR MOTOR FUSION', icon: <Activity size={13} color="#A1A1AA" /> },
    { label: '2.15 - 7.2 MS LATENCY', icon: <Zap size={13} color="#71717A" /> },
    { label: 'ZERO-LEAKAGE STRATIFIED TEST', icon: null },
  ];

  return (
    <section className="hero-section" style={{ position: 'relative', marginBottom: '48px', paddingTop: '16px' }}>
      {/* Top Announcement Pill */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div
          className="hero-status-pill"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 18px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendStatus === 'online' ? '#FFFFFF' : '#71717A',
              boxShadow: backendStatus === 'online' ? '0 0 10px rgba(255, 255, 255, 0.9)' : 'none',
            }}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Scientific Transparency Standard ·{' '}
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF' }}>
            <FoldText text="Hwaidi & Ghanem, NeuroImage 328 (2026)" foldColor="#FFFFFF" />
          </span>
        </div>
      </div>

      {/* Hero Heading with SplitText */}
      <div style={{ textAlign: 'center', maxWidth: '980px', margin: '0 auto', marginBottom: '20px' }}>
        <SplitText
          tag="h1"
          text="Precision Neural Decoding for Motor Imagery BCI"
          splitBy="words"
          className="hero-heading"
          style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            margin: '0 0 16px 0',
          }}
        />

        <p
          className="hero-subheading"
          style={{
            fontSize: 'clamp(1rem, 1.3vw, 1.18rem)',
            lineHeight: 1.65,
            color: '#A1A1AA',
            maxWidth: '780px',
            margin: '0 auto 28px auto',
            fontWeight: 400,
          }}
        >
          Production-grade 4-class motor imagery classification powered by <strong>5-pair spatial fusion</strong>,
          a closed-form <strong>MiniRocket + Ridge</strong> pipeline, and strictly verified zero-leakage evaluation
          across the 64-channel PhysioNet EEGMMIDB benchmark cohort.
        </p>

        {/* WrapText Specs Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <WrapText items={specs} highlightIndex={0} />
        </div>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <StarBorder
            as="button"
            onClick={onLaunchLive}
            color="#FFFFFF"
            speed="3.5s"
            style={{
              padding: '1px',
              borderRadius: '9999px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 28px',
                background: '#FFFFFF',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.94rem',
                borderRadius: '9999px',
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
              }}
            >
              <Play size={16} fill="#000000" color="#000000" />
              <span>Launch Live Playback</span>
              <span
                className="mono"
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  color: '#000000',
                  fontWeight: 700,
                }}
              >
                163 HZ
              </span>
            </div>
          </StarBorder>

          <button
            onClick={onViewBenchmarks}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '13px 26px',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.92rem',
              color: '#FFFFFF',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(16px)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            }}
          >
            <span>Explore Ground-Truth Benchmarks</span>
            <ArrowUpRight size={16} color="#FFFFFF" />
          </button>
        </div>
      </div>

      {/* LineWaves EEG Ribbon */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 28px auto', position: 'relative' }}>
        <LineWaves height={140} speed={0.018} />
      </div>

      {/* ScrollExpand Interactive Showcase Preview */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <ScrollExpand
          title="PhysioNet EEG Telemetry & Oscilloscope Preview"
          badge={currentTrial ? `TRIAL: ${currentTrial.dataset_name ? currentTrial.dataset_name.split(':')[0] : currentTrial.trial_id}` : 'STANDBY'}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: '#FFFFFF', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '6px' }}>
                NEUROMUSCULAR OSCILLATIONS
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0' }}>
                Continuous Mu & Beta Rhythm Tracking
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#A1A1AA', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Spatial differential pairs (C3-C4, C1-C2, FC3-FC4, CP3-CP4, C5-C6) isolate event-related desynchronization (ERD) and synchronization (ERS) with Butterworth 8–30 Hz bandpass filtering.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onLaunchLive}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #FFFFFF',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Activity size={14} />
                  <span>Open Full Oscilloscope</span>
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(10, 10, 10, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#71717A' }}>
                <span>STREAM: BCI2000 WS-FEED</span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>CONNECTED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A1A1AA' }}>Primary Channel:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>C3-C4 (Bipolar)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A1A1AA' }}>Sampling Frequency:</span>
                  <span style={{ color: '#D4D4D8' }}>128.0 Hz</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A1A1AA' }}>Inference Engine:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>MiniRocket Ridge (6.1ms)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A1A1AA' }}>Multi-Class Separation:</span>
                  <span style={{ color: '#D4D4D8' }}>ROC-AUC 0.9956</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollExpand>
      </div>
    </section>
  );
}
