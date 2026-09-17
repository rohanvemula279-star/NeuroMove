import React from 'react';
import { Play, ShieldCheck, Cpu, ArrowUpRight, Activity, Zap } from 'lucide-react';
import WrapText from './effects/WrapText';
import LineWaves from './effects/LineWaves';
import ScrollExpand from './effects/ScrollExpand';
import WarpText from './effects/WarpText';
import GradientText from './effects/GradientText';
import RotatingText from './effects/RotatingText';
import ScrollVelocity from './effects/ScrollVelocity';
import SpecularButton from './ui/SpecularButton';
import Lanyard from './ui/Lanyard';

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
      {/* Top Announcement Pill with RotatingText */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div
          className="hero-status-pill"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 22px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendStatus === 'online' ? '#10B981' : '#71717A',
              boxShadow: backendStatus === 'online' ? '0 0 10px #10B981' : 'none',
            }}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Scientific Transparency Standard ·{' '}
          </span>
          <RotatingText
            texts={[
              '97.41% MiniRocket Accuracy',
              '0% Data Leakage Verified',
              'Sub-10ms Inference Latency',
              'PhysioNet 109 Subjects Cohort',
              'Hwaidi & Ghanem (2026)',
            ]}
            interval={2600}
            highlightColor="#FFFFFF"
          />
        </div>
      </div>

      {/* Hero Heading with WarpText and GradientText */}
      <div style={{ textAlign: 'center', maxWidth: '980px', margin: '0 auto', marginBottom: '24px' }}>
        <h1
          className="hero-heading"
          style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            margin: '0 0 16px 0',
          }}
        >
          <WarpText text="Precision Neural Decoding" interactive={true} />
          <br />
          <GradientText
            colors={['#FFFFFF', '#38BDF8', '#60A5FA', '#10B981', '#FFFFFF']}
            animationSpeed={5}
          >
            for Motor Imagery BCI
          </GradientText>
        </h1>

        {/* TextPressure on interactive description */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <p
            className="hero-subheading"
            style={{
              fontSize: 'clamp(1rem, 1.3vw, 1.18rem)',
              lineHeight: 1.65,
              color: '#A1A1AA',
              maxWidth: '820px',
              margin: '0 auto',
              fontWeight: 400,
            }}
          >
            Production-grade 4-class motor imagery classification powered by <strong>5-pair spatial fusion</strong>,
            a closed-form <strong>MiniRocket + Ridge</strong> pipeline, and strictly verified zero-leakage evaluation
            across the 64-channel PhysioNet EEGMMIDB benchmark cohort.
          </p>
        </div>

        {/* WrapText Specs Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <WrapText items={specs} highlightIndex={0} />
        </div>

        {/* Hero CTAs with SpecularButton and StarBorder */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <SpecularButton
            onClick={onLaunchLive}
            variant="primary"
            icon={<Play size={16} fill="#000000" color="#000000" />}
          >
            <span>Launch Live Playback</span>
            <span
              className="mono"
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(0, 0, 0, 0.12)',
                color: '#000000',
                fontWeight: 800,
                marginLeft: '4px',
              }}
            >
              163 HZ
            </span>
          </SpecularButton>

          <SpecularButton
            onClick={onViewBenchmarks}
            variant="secondary"
            icon={<ArrowUpRight size={16} color="#FFFFFF" />}
          >
            <span>Explore Ground-Truth Benchmarks</span>
          </SpecularButton>
        </div>
      </div>

      {/* LineWaves Oscilloscope Ribbon */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 28px auto', position: 'relative' }}>
        <LineWaves height={130} speed={0.016} />
      </div>

      {/* Kinetic Velocity-reactive Marquee Ribbon */}
      <div style={{ margin: '0 0 32px 0' }}>
        <ScrollVelocity
          texts={[
            'NEUROMOVE BCI',
            '5-PAIR SPATIAL FUSION',
            'ZERO DATA LEAKAGE',
            '97.41% TEST ACC',
            '2.15 MS LATENCY',
            'PHYSIOMET COHORT',
          ]}
          baseVelocity={1.4}
        />
      </div>

      {/* ScrollExpand Interactive Showcase Preview with Lanyard Badge */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <ScrollExpand
          title="PhysioNet EEG Telemetry & Interactive Verification"
          badge={currentTrial ? `TRIAL: ${currentTrial.dataset_name ? currentTrial.dataset_name.split(':')[0] : currentTrial.trial_id}` : 'STANDBY'}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '6px' }}>
                NEUROMUSCULAR OSCILLATIONS
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0' }}>
                Continuous Mu & Beta Rhythm Tracking
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#A1A1AA', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Spatial differential pairs (C3-C4, C1-C2, FC3-FC4, CP3-CP4, C5-C6) isolate event-related desynchronization (ERD) and synchronization (ERS) with Butterworth 8–30 Hz bandpass filtering.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <SpecularButton onClick={onLaunchLive} variant="glow" icon={<Activity size={14} />}>
                  Open Full Oscilloscope
                </SpecularButton>
              </div>
            </div>

            {/* Interactive Physics Lanyard Badge */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Lanyard
                name="PHYSIOMET BENCHMARK"
                id="ZERO-LEAKAGE-SMR"
                affiliation="NeuroImage 328 (2026)"
                status="VERIFIED 97.41%"
              />
            </div>

            {/* Telemetry Diagnostics Card */}
            <div
              style={{
                background: 'rgba(10, 10, 10, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#71717A' }}>
                <span>STREAM: BCI2000 WS-FEED</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>● CONNECTED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  <span style={{ color: '#38BDF8', fontWeight: 600 }}>MiniRocket Ridge (6.1ms)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A1A1AA' }}>Multi-Class Separation:</span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>ROC-AUC 0.9956</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollExpand>
      </div>
    </section>
  );
}
