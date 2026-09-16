import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import LiveView from './views/LiveView';
import DashboardView from './views/DashboardView';
import LeaderboardView from './views/LeaderboardView';
import ExplainerView from './views/ExplainerView';
import ClickSpark from './components/effects/ClickSpark';
import GradualBlur from './components/effects/GradualBlur';
import { checkHealth, getMetrics, getSubjects, loadSampleTrial } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedModel, setSelectedModel] = useState('minirocket');
  const [currentTrial, setCurrentTrial] = useState(null);

  // Backend state
  const [backendHealth, setBackendHealth] = useState(null);
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(null);

  // Health check & Initial data load
  useEffect(() => {
    let isMounted = true;

    // 1. Health check
    checkHealth()
      .then((health) => {
        if (isMounted) {
          setBackendHealth(health);
          setBackendStatus('online');
        }
      })
      .catch(() => {
        if (isMounted) setBackendStatus('offline');
      });

    // 2. Fetch production metrics (MiniRocket, subject_dependent)
    setMetricsLoading(true);
    getMetrics('minirocket', 'subject_dependent')
      .then((data) => {
        if (isMounted) {
          setMetrics(data);
          setMetricsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setMetricsError(err.message);
          setMetricsLoading(false);
        }
      });

    // 3. Fetch subjects leaderboard (subject_dependent)
    setLeaderboardLoading(true);
    getSubjects('subject_dependent')
      .then((data) => {
        if (isMounted) {
          setLeaderboardData(data);
          setLeaderboardLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setLeaderboardError(err.message);
          setLeaderboardLoading(false);
        }
      });

    // 4. Preload a real sample trial
    loadSampleTrial()
      .then((trial) => {
        if (isMounted && !currentTrial) {
          setCurrentTrial(trial);
        }
      })
      .catch(() => {
        // Silent fallback
      });

    return () => { isMounted = false; };
  }, []);

  // When model is switched, reload metrics for that model
  const handleModelChange = (model) => {
    setSelectedModel(model);
    setMetricsLoading(true);
    setMetricsError(null);
    getMetrics(model, 'subject_dependent')
      .then((data) => {
        setMetrics(data);
        setMetricsLoading(false);
      })
      .catch((err) => {
        setMetricsError(err.message);
        setMetricsLoading(false);
      });
  };

  const handleLaunchLive = () => {
    setActiveTab('live');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreLeaderboard = () => {
    setActiveTab('leaderboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreExplainer = () => {
    setActiveTab('explainer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewBenchmarks = () => {
    setActiveTab('dashboard');
    const el = document.getElementById('metric-card-prod-acc');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-shell" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 1. Crisp Pure White Click Spark Effect */}
      <ClickSpark sparkColor="#FFFFFF" sparkCount={10} sparkRadius={26} duration={420} />

      {/* 2. Progressive Gradual Blur Vignette */}
      <GradualBlur position="top" height="70px" maxBlur={18} />

      <div className="app-container">
        {/* 3. Floating Capsule Glass Navigation */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          backendHealth={backendHealth}
          backendStatus={backendStatus}
          currentTrial={currentTrial}
        />

        {/* 4. Editorial SaaS Hero Section (on Dashboard / Home) */}
        {activeTab === 'dashboard' && (
          <HeroSection
            onLaunchLive={handleLaunchLive}
            onViewBenchmarks={handleViewBenchmarks}
            backendStatus={backendStatus}
            currentTrial={currentTrial}
          />
        )}

        {/* 5. Main View Content */}
        <main>
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              loading={metricsLoading}
              error={metricsError}
              onLaunchLive={handleLaunchLive}
              onExploreLeaderboard={handleExploreLeaderboard}
              onExploreExplainer={handleExploreExplainer}
            />
          )}

          {activeTab === 'live' && (
            <LiveView
              currentTrial={currentTrial}
              onTrialLoaded={setCurrentTrial}
              selectedModel={selectedModel}
              onSelectModel={handleModelChange}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              leaderboardData={leaderboardData}
              metricsData={metrics}
              loading={leaderboardLoading}
              error={leaderboardError}
            />
          )}

          {activeTab === 'explainer' && (
            <ExplainerView currentTrial={currentTrial} />
          )}
        </main>

        {/* 6. Editorial Research Instrument Footer (Sentinel 4-Column Layout) */}
        <footer
          style={{
            marginTop: '96px',
            paddingTop: '48px',
            paddingBottom: '40px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '36px',
              marginBottom: '40px',
            }}
          >
            {/* Col 1: Brand & Academic Context */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                  }}
                />
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                  NeuroMove
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                  }}
                >
                  ACADEMIC BCI
                </span>
              </div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
                Unified 4-Class Motor Imagery EEG Classification & Transparency Benchmark. Academic Capstone Project,
                engineered for zero-leakage neuroprosthetic decoding at 6.1ms latency.
              </p>
            </div>

            {/* Col 2: Platform & Models */}
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.88rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Architectures & Benchmarks
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'var(--text-tertiary)' }}>
                <li>
                  <button
                    onClick={handleLaunchLive}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    MiniRocket Classifier (95.80%)
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLaunchLive}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    EEGNet 4-Class (81.40%)
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleExploreLeaderboard}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    Cross-Subject Leaderboard (S001–S010)
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleExploreExplainer}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    Sensorimotor Mu/Beta (8–30 Hz) Waves
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Rigor & Transparency */}
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.88rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Scientific Protocol
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'var(--text-tertiary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF' }} />
                  <span>Zero-Leakage Guarantee (0.00%)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4D4D8' }} />
                  <span>10-Fold Stratified Cross-Validation</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A1A1AA' }} />
                  <span>5-Pair Spatial Differential Bipolar</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#71717A' }} />
                  <span>Empirical Baseline Floor (46.20%)</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Citations & Open Source */}
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.88rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Academic Citations
              </div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 8px' }}>
                Hwaidi & Ghanem (2026), <em>NeuroImage</em> 328: 121087.<br />
                PhysioNet Motor Imagery EEG Corpus.<br />
                FastAI / Dempster et al. (2021) ROCKET.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                  }}
                >
                  MIT LICENSE
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                  }}
                >
                  COLLEGE SUBMISSION 2026
                </span>
              </div>
            </div>
          </div>

          {/* Sub-footer Copyright Bar */}
          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <div>
              © 2026 NeuroMove BCI Research Benchmark. All rights reserved.
            </div>
            <div className="mono" style={{ display: 'flex', gap: '16px', fontSize: '0.74rem' }}>
              <span style={{ color: '#FFFFFF' }}>● ZERO-LEAKAGE AUDITED</span>
              <span style={{ color: '#D4D4D8' }}>● LATENCY &lt; 7MS</span>
              <span style={{ color: '#A1A1AA' }}>● 10-SUBJECT CORRELATION GRAPH</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
