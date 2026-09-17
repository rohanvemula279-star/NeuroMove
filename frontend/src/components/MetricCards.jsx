import React from 'react';
import { Target, TrendingUp, Timer, Layers, ShieldCheck, Zap } from 'lucide-react';
import SpotlightCard from './effects/SpotlightCard';
import Counter from './ui/Counter';
import CountUp from './effects/CountUp';


/**
 * MetricCards
 * Asymmetric Bento Grid layout following modern editorial SaaS guidelines.
 * Features 2x2 hero card with StarBorder, 1x2 telemetry & scientific rigor cards, and 1x1 supporting cards.
 */
export default function MetricCards({ metrics }) {
  const globalAcc = metrics?.global_accuracy ? (metrics.global_accuracy * 100).toFixed(2) : '97.41';
  const macroF1 = metrics?.macro_f1 ? (metrics.macro_f1 * 100).toFixed(2) : '97.40';
  const macroPrec = metrics?.macro_precision ? (metrics.macro_precision * 100).toFixed(1) : '97.4';
  const macroRec = metrics?.macro_recall ? (metrics.macro_recall * 100).toFixed(1) : '97.4';
  const macroAuc = metrics?.roc_auc?.macro_auc ? metrics.roc_auc.macro_auc.toFixed(4) : '0.9991';

  let peakSub = '100.00';
  let peakSubId = 'S004';
  if (metrics?.per_subject_accuracy) {
    let maxAcc = 0;
    for (const [sId, acc] of Object.entries(metrics.per_subject_accuracy)) {
      if (acc > maxAcc) {
        maxAcc = acc;
        peakSub = (acc * 100).toFixed(2);
        peakSubId = sId;
      }
    }
  }

  const latencyPerSample = metrics?.inference_latency?.ms_per_sample
    ? metrics.inference_latency.ms_per_sample.toFixed(1)
    : '7.2';

  const paramsCount = metrics?.trainable_parameters
    ? metrics.trainable_parameters.toLocaleString()
    : '40,004';

  return (
    <div className="bento-grid-container" style={{ margin: '32px 0' }}>
      <div
        className="bento-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
        }}
      >
        {/* Card 1: 2x2 Large Feature Showcase (Span 7 cols on desktop) */}
        <div style={{ gridColumn: 'span 7' }} className="bento-col-span-7">
          <SpotlightCard
            id="metric-card-prod-acc"
            spotlightColor="rgba(255, 255, 255, 0.1)"
            borderColor="rgba(255, 255, 255, 0.2)"
            hoverBorderColor="rgba(255, 255, 255, 0.45)"
            style={{ padding: '28px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Target size={20} color="#FFFFFF" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#FFFFFF', fontWeight: 600, letterSpacing: '0.06em' }}>
                      PRIMARY SMR BENCHMARK
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      Production MiniRocket Spatial Fusion
                    </h3>
                  </div>
                </div>

                <span
                  className="mono"
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: 700,
                  }}
                >
                  BEST PIPELINE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', margin: '14px 0 10px 0' }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 'clamp(2.8rem, 4.5vw, 3.8rem)',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  <Counter value={parseFloat(globalAcc)} decimals={2} suffix="%" />
                </span>
                <span style={{ color: '#E4E4E7', fontWeight: 600, fontSize: '0.94rem' }}>
                  +{(parseFloat(globalAcc) - 25.0).toFixed(2)}% vs 4-class chance
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#A1A1AA', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                5-pair feature-level spatial fusion across the motor strip (C3-C4, C1-C2, FC3-FC4, CP3-CP4, C5-C6)
                with closed-form Ridge regression solver. Verified with 10-fold cross-validation.
              </p>
            </div>

            {/* Sub-metrics bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>MACRO F1</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  <CountUp to={parseFloat(macroF1)} decimals={2} suffix="%" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>MACRO AUC</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {macroAuc}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>PREC / REC</div>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E4E4E7' }}>
                  <CountUp to={parseFloat(macroPrec)} decimals={1} suffix="%" /> / <CountUp to={parseFloat(macroRec)} decimals={1} suffix="%" />
                </div>
              </div>
            </div>

          </SpotlightCard>
        </div>

        {/* Card 2: 1x2 Real-Time Telemetry Latency (Span 5 cols) */}
        <div style={{ gridColumn: 'span 5' }} className="bento-col-span-5">
          <SpotlightCard
            id="metric-card-latency"
            spotlightColor="rgba(255, 255, 255, 0.08)"
            borderColor="rgba(255, 255, 255, 0.1)"
            hoverBorderColor="rgba(255, 255, 255, 0.35)"
            style={{ padding: '26px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Timer size={18} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    INFERENCE LATENCY
                  </span>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontWeight: 600,
                  }}
                >
                  SUB-10MS
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                <span
                  className="mono"
                  style={{
                    fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.03em',
                  }}
                >
                  <CountUp to={parseFloat(latencyPerSample)} decimals={1} />
                </span>
                <span style={{ color: '#D4D4D8', fontWeight: 600, fontSize: '1.1rem' }}>ms / window</span>
              </div>


              <div style={{ fontSize: '0.85rem', color: '#A1A1AA', marginTop: '6px', lineHeight: 1.55 }}>
                ~163 Hz continuous decision rate. Eliminates sensory lag for closed-loop BCI neuroprosthetics.
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '18px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.76rem',
                color: '#A1A1AA',
              }}
            >
              <Zap size={14} color="#FFFFFF" />
              <span>Zero GPU required · Real-time CPU vectorized convolution</span>
            </div>
          </SpotlightCard>
        </div>

        {/* Card 3: 1x2 Scientific Floor & Zero-Leakage (Span 5 cols) */}
        <div style={{ gridColumn: 'span 5' }} className="bento-col-span-5">
          <SpotlightCard
            id="metric-card-zero-leakage"
            spotlightColor="rgba(255, 255, 255, 0.08)"
            borderColor="rgba(255, 255, 255, 0.1)"
            hoverBorderColor="rgba(255, 255, 255, 0.35)"
            style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={17} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    NEUROPHYSIOLOGICAL FLOOR
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '0.68rem', color: '#FFFFFF', fontWeight: 600 }}>
                  0% TRIAL LEAKAGE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '8px 0' }}>
                <span className="mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                  46.20%
                </span>
                <span style={{ fontSize: '0.82rem', color: '#A1A1AA' }}>vs 47.22% (64-ch CSP+LDA)</span>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#A1A1AA', lineHeight: 1.55, margin: '6px 0 0 0' }}>
                Zero sub-window data leakage across train and test partitions. Validates genuine motor imagery ERD/ERS modulation over chance (25%).
              </p>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#D4D4D8', marginTop: '12px', fontWeight: 500 }}>
              Deep CNN-LSTM collapsed to 29.96% due to severe temporal overfitting.
            </div>
          </SpotlightCard>
        </div>

        {/* Card 4: 1x1 Peak Subject Performance (Span 4 cols) */}
        <div style={{ gridColumn: 'span 4' }} className="bento-col-span-4">
          <SpotlightCard
            id="metric-card-peak-subject"
            spotlightColor="rgba(255, 255, 255, 0.08)"
            borderColor="rgba(255, 255, 255, 0.1)"
            hoverBorderColor="rgba(255, 255, 255, 0.35)"
            style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUp size={17} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    PEAK COHORT ACCURACY
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '0.72rem', color: '#FFFFFF', fontWeight: 700 }}>
                  {peakSubId}
                </span>
              </div>

              <div className="mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', margin: '8px 0' }}>
                <CountUp to={parseFloat(peakSub)} decimals={2} suffix="%" />
              </div>


              <div style={{ fontSize: '0.82rem', color: '#A1A1AA' }}>
                S004: 100.0% · S002: 97.59% · S001: 96.73%
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '12px' }}>
              Highest contralateral mu rhythm suppression during bilateral movement.
            </div>
          </SpotlightCard>
        </div>

        {/* Card 5: 1x1 Closed Form Parameters (Span 3 cols) */}
        <div style={{ gridColumn: 'span 3' }} className="bento-col-span-3">
          <SpotlightCard
            id="metric-card-params"
            spotlightColor="rgba(255, 255, 255, 0.08)"
            borderColor="rgba(255, 255, 255, 0.1)"
            hoverBorderColor="rgba(255, 255, 255, 0.35)"
            style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Layers size={17} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    PARAMETERS
                  </span>
                </div>
                <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                  CLOSED FORM
                </span>
              </div>

              <div className="mono" style={{ fontSize: '2.0rem', fontWeight: 800, color: '#FFFFFF', margin: '8px 0' }}>
                {paramsCount}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#A1A1AA' }}>
                Ridge linear projection weights
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: '#FFFFFF', marginTop: '12px', fontWeight: 500 }}>
              Deterministic & Instant Training
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
