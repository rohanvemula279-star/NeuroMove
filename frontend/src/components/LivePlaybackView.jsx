import React, { useState, useEffect, useRef } from 'react';
import { Activity, Radio, AlertCircle, Zap } from 'lucide-react';

import { createStreamWebSocket, predictTrial, getTrialSignals, loadSampleTrial } from '../api/client';
import ProbabilityBars from './ProbabilityBars';
import DecisionCallout from './DecisionCallout';

export default function LivePlaybackView({ currentTrial, selectedModel, onTrialLoaded }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [streamProgress, setStreamProgress] = useState(0); // 0 to 100%
  const [finalPrediction, setFinalPrediction] = useState(null);
  const [finalPredictions, setFinalPredictions] = useState([]);
  const [liveProbabilities, setLiveProbabilities] = useState({ T1: 0.25, T2: 0.25, T3: 0.25, T4: 0.25 });
  const [streamError, setStreamError] = useState(null);
  const [waveformSignal, setWaveformSignal] = useState(null);
  const canvasRef = useRef(null);
  const activeSocketRef = useRef(null);

  // Load trial waveform preview when trial changes
  useEffect(() => {
    if (!currentTrial?.trial_id) return;
    setFinalPrediction(null);
    setFinalPredictions([]);
    setCurrentFrame(null);
    setStreamProgress(0);
    setStreamError(null);
    setLiveProbabilities({ T1: 0.25, T2: 0.25, T3: 0.25, T4: 0.25 });

    let isMounted = true;
    getTrialSignals(currentTrial.trial_id)
      .then((sig) => {
        if (isMounted) setWaveformSignal(sig);
      })
      .catch((err) => {
        console.warn('Could not load waveform preview:', err);
      });

    return () => {
      isMounted = false;
      if (activeSocketRef.current) {
        activeSocketRef.current.close();
      }
    };
  }, [currentTrial?.trial_id]);

  // Draw EEG oscilloscope on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Waveform data
    const signalData = waveformSignal?.filtered_pairs?.['C3-C4'] || waveformSignal?.raw_preview;
    const pointsCount = signalData ? signalData.length : 128;
    const pts = signalData || Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.2) * 0.4 + Math.sin(i * 0.05) * 0.8);

    // Waveform trace (Stark White Oscilloscope Beam)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    for (let i = 0; i < pointsCount; i++) {
      const x = (i / (pointsCount - 1)) * width;
      const val = pts[i];
      const y = (height / 2) - (val * 35);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Time Cursor (if streaming or progress > 0)
    const cursorX = (streamProgress / 100) * width;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, height);
    ctx.stroke();
    ctx.shadowBlur = 0;

  }, [waveformSignal, streamProgress]);

  // Execute Live WebSocket Stream
  const handleStartStream = () => {
    if (!currentTrial?.trial_id) {
      setStreamError('Please upload a trial file or load the sample trial first.');
      return;
    }

    setIsStreaming(true);
    setStreamError(null);
    setStreamProgress(0);

    const socket = createStreamWebSocket(currentTrial.trial_id, {
      onFrame: (frame) => {
        setCurrentFrame(frame);
        setLiveProbabilities(frame.class_probabilities);
        const progress = Math.min(100, Math.round(((frame.frame_index + 1) / 9) * 100));
        setStreamProgress(progress);
      },
      onComplete: () => {
        setIsStreaming(false);
        setStreamProgress(100);
        // Automatically fetch final consensus prediction from both models
        predictTrial(currentTrial.trial_id, 'both')
          .then((preds) => {
            if (preds && preds.length > 0) {
              setFinalPredictions(preds);
              setFinalPrediction(preds[0]);
              setLiveProbabilities(preds[0].class_probabilities);
            }
          })
          .catch((err) => console.warn(err));
      },
      onError: (err) => {
        setIsStreaming(false);
        setStreamError(err.message || 'Stream error occurred.');
      },
    });

    activeSocketRef.current = socket;
  };

  // Direct 1-Click Classification (non-streaming)
  const handleDirectPredict = async (forcedModel = null) => {
    if (!currentTrial?.trial_id) {
      setStreamError('Please upload a trial file or pick a benchmark class below to test.');
      return;
    }

    const modelToUse = forcedModel || 'both';
    setIsPredicting(true);
    setStreamError(null);
    try {
      const preds = await predictTrial(currentTrial.trial_id, modelToUse);
      if (preds && preds.length > 0) {
        setFinalPredictions(preds);
        setFinalPrediction(preds[0]);
        setLiveProbabilities(preds[0].class_probabilities);
        setStreamProgress(100);
      }
    } catch (err) {
      setStreamError(err.message || 'Classification failed.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Quick 1-Click Test: Load specific class and predict immediately with both champion models
  const handleQuickTest = async (datasetId) => {
    setIsPredicting(true);
    setStreamError(null);
    setFinalPrediction(null);
    setFinalPredictions([]);
    setStreamProgress(0);
    try {
      const trial = await loadSampleTrial(datasetId);
      if (onTrialLoaded) onTrialLoaded(trial);
      // Run inference immediately with dual champions (MiniRocket + CNN-LSTM)
      const preds = await predictTrial(trial.trial_id, 'both');
      if (preds && preds.length > 0) {
        setFinalPredictions(preds);
        setFinalPrediction(preds[0]);
        setLiveProbabilities(preds[0].class_probabilities);
        setStreamProgress(100);
      }
    } catch (err) {
      setStreamError(err.message || 'Quick test failed.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Find current top class
  let leadingCls = null;
  let maxP = 0;
  for (const [k, v] of Object.entries(liveProbabilities)) {
    if (v > maxP) {
      maxP = v;
      leadingCls = k;
    }
  }

  const QUICK_CLASSES = [
    { code: 'T1', label: 'Left Fist', datasetId: 'ds_01', color: '#38BDF8', subject: 'S001' },
    { code: 'T2', label: 'Right Fist', datasetId: 'ds_02', color: '#60A5FA', subject: 'S001' },
    { code: 'T3', label: 'Both Fists', datasetId: 'ds_03', color: '#10B981', subject: 'S001' },
    { code: 'T4', label: 'Both Feet', datasetId: 'ds_04', color: '#F59E0B', subject: 'S001' },
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Controls */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} color="#FFFFFF" />
                Live Motor Imagery Streaming & Dual Model Evaluation
              </h2>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                <Zap size={12} />
                ACTIVE: DUAL CHAMPIONS (97.41% & 97.16% ACC)
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Sub-10ms dual-model inference evaluating motor imagery intent across 5 sensorimotor pairs
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="btn-run-stream"
              className="btn btn-primary"
              onClick={handleStartStream}
              disabled={!currentTrial || isStreaming || isPredicting}
            >
              <Radio size={16} />
              {isStreaming ? `Streaming (${streamProgress}%)` : 'Start Live Stream'}
            </button>

            <button
              id="btn-run-classification"
              className="btn btn-emerald"
              onClick={() => handleDirectPredict('both')}
              disabled={!currentTrial || isStreaming || isPredicting}
              style={{ fontWeight: 700, boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)' }}
              title="Runs inference using Dual AI Champions (MiniRocket 97.41% & CNN-LSTM 97.16% Accuracy)"
            >
              <Zap size={16} />
              {isPredicting ? 'Evaluating Raw Data...' : 'Run Experiment & Verify Accurate Answer'}
            </button>
          </div>
        </div>

        {/* Interactive 1-Click Benchmark Class Bar */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-surface-0)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="#FFFFFF" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              QUICK TEST REAL MOTOR CLASSES (1-CLICK BENCHMARK & PREDICT):
            </span>
          </div>


          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {QUICK_CLASSES.map((cls) => (
              <button
                key={cls.code}
                id={`btn-quick-test-${cls.code.toLowerCase()}`}
                onClick={() => handleQuickTest(cls.datasetId)}
                disabled={isPredicting || isStreaming}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: `1px solid ${cls.color}55`,
                  background: `${cls.color}15`,
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isPredicting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${cls.color}35`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${cls.color}15`; }}
              >
                <span style={{
                  background: cls.color,
                  color: '#000000',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontSize: '0.72rem'
                }}>
                  {cls.code}
                </span>
                <span>{cls.label}</span>
              </button>
            ))}
          </div>
        </div>

        {streamError && (
          <div style={{
            marginTop: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{streamError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Oscilloscope + Probabilities */}
      <div className="grid-2">
        {/* Left: Oscilloscope Trace */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: '14px' }}>
            <div>
              <h3 className="card-title" style={{ fontSize: '1.05rem' }}>
                <Activity size={18} color="#FFFFFF" />
                EEG Channel Oscilloscope (C3–C4 Motor Cortex)
              </h3>
              <p className="card-subtitle">
                Continuous 4.0-second sensorimotor trace with live inference scan cursor
              </p>
            </div>

            {currentFrame && (
              <span className="badge badge-amber mono" style={{ fontSize: '0.72rem' }}>
                WINDOW {currentFrame.frame_index + 1}/9 · {currentFrame.window_start_s}s–{currentFrame.window_end_s}s
              </span>
            )}
          </div>

          <div className="oscilloscope-canvas-wrap" style={{ position: 'relative', height: '220px', width: '100%' }}>
            <canvas
              ref={canvasRef}
              width={560}
              height={220}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {/* Time Axis Labels */}
            <div style={{
              position: 'absolute',
              bottom: '4px',
              left: '8px',
              right: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none'
            }}>
              <span>t = 0.0s (Cue)</span>
              <span>1.0s</span>
              <span>2.0s</span>
              <span>3.0s</span>
              <span>t = 4.0s (End)</span>
            </div>
          </div>

          {/* Sub-window Progress Bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
              <span>TRIAL PLAYBACK TIMELINE</span>
              <span className="mono">{streamProgress}% COMPLETED</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-surface-0)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${streamProgress}%`,
                background: 'linear-gradient(90deg, #FFFFFF, #71717A)',
                transition: 'width 0.15s linear'
              }} />
            </div>
          </div>

          {/* Frame Telemetry */}
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            fontSize: '0.78rem'
          }}>
            <div style={{ background: 'var(--bg-surface-0)', padding: '8px 10px', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>FRAME: </span>
              <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {currentFrame ? `${currentFrame.frame_index + 1}/9` : 'Idle'}
              </span>
            </div>
            <div style={{ background: 'var(--bg-surface-0)', padding: '8px 10px', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>WINDOW: </span>
              <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {currentFrame ? `${currentFrame.window_start_s}s - ${currentFrame.window_end_s}s` : '0.0s - 4.0s'}
              </span>
            </div>
            <div style={{ background: 'var(--bg-surface-0)', padding: '8px 10px', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-tertiary)' }}>STREAM STATUS: </span>
              <span className="mono" style={{ color: isStreaming ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontWeight: 600 }}>
                {isStreaming ? 'STREAMING' : (streamProgress === 100 ? 'FINISHED' : 'READY')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Probability Bars */}
        <ProbabilityBars
          probabilities={liveProbabilities}
          leadingClass={leadingCls}
        />
      </div>

      {/* Decision Callout Card with Dual-Model Comparison & Ground Truth Verification */}
      <DecisionCallout
        prediction={finalPrediction}
        predictions={finalPredictions}
        currentTrial={currentTrial}
      />
    </div>
  );
}
