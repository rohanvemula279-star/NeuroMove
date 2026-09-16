import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import SpotlightCard from './effects/SpotlightCard';

/**
 * PricingSection
 * Section: One platform, priced to scale with your team (Academic, Clinical, Enterprise)
 */
export default function PricingSection({ onStartFree }) {
  const plans = [
    {
      name: 'Starter',
      target: 'Academic Research Lab',
      price: '$12',
      period: '/ user / mo',
      billing: 'billed monthly per user',
      highlight: false,
      features: [
        'Up to 10 researcher seats',
        'Real-time 4-class MI detection engine',
        'PhysioNet EEGMMIDB 64-channel support',
        '7-day signal cache retention',
        'Standard zero-leakage benchmark reports',
        'Community research support',
      ],
      ctaText: 'Start for free',
    },
    {
      name: 'Team',
      target: 'Clinical BCI & Rehab Team',
      price: '$28',
      period: '/ user / mo',
      billing: 'billed monthly per user',
      highlight: true,
      features: [
        'Everything in Starter',
        'Automated closed-loop actuation triggers',
        'Unified 5-pair motor cortex correlation',
        '90-day EEG telemetry retention',
        'Subject-specific calibration & leaderboard',
        'Priority clinical investigator support',
      ],
      ctaText: 'Start free trial',
    },
    {
      name: 'Enterprise',
      target: 'Hospital & Neurotech Core',
      price: '$48',
      period: '/ user / mo',
      billing: 'billed monthly per user',
      highlight: false,
      features: [
        'Everything in Team',
        'Medical device compliance & audit trail',
        'Multi-subject cohort federation',
        'Custom electrode montage fusion (128-ch)',
        '1-year telemetry retention',
        'Dedicated microsecond CPU/GPU SLAs',
      ],
      ctaText: 'Start free trial',
    },
  ];

  return (
    <section className="pricing-section" style={{ margin: '64px 0' }}>
      <div style={{ maxWidth: '820px', marginBottom: '36px' }}>
        <span
          className="mono"
          style={{
            fontSize: '0.74rem',
            color: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Predictable Pricing
        </span>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            margin: '8px 0 16px 0',
            lineHeight: 1.15,
          }}
        >
          One platform, priced to scale with your team
        </h2>
        <p style={{ fontSize: '1.02rem', color: '#A1A1AA', lineHeight: 1.65, margin: 0 }}>
          Every plan runs the full MiniRocket 5-pair detection engine. Add retention, real-time automation, and clinical
          governance as your program grows — billed per user, with no per-signal surprises.
        </p>
      </div>

      <div
        className="pricing-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {plans.map((plan, index) => (
          <SpotlightCard
            key={index}
            spotlightColor={plan.highlight ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)'}
            borderColor={plan.highlight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.1)'}
            hoverBorderColor={plan.highlight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.25)'}
            style={{
              padding: '30px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {plan.name}
                </h3>
                {plan.highlight && (
                  <span
                    className="mono"
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    MOST POPULAR
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#A1A1AA', marginBottom: '16px' }}>
                {plan.target}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '14px 0 4px 0' }}>
                <span className="mono" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#A1A1AA' }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginBottom: '22px' }}>
                {plan.billing}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((feat, fIdx) => (
                  <li
                    key={fIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.84rem',
                      color: '#EDEDED',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={11} color="#FFFFFF" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onStartFree}
              className={plan.highlight ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                width: '100%',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 700,
              }}
            >
              <span>{plan.ctaText}</span>
              <ArrowRight size={14} />
            </button>
          </SpotlightCard>
        ))}
      </div>

      {/* Tailored deployment banner */}
      <SpotlightCard
        spotlightColor="rgba(255, 255, 255, 0.04)"
        borderColor="rgba(255, 255, 255, 0.08)"
        style={{
          marginTop: '32px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Need a tailored clinical or academic deployment?
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#A1A1AA', margin: 0 }}>
            Talk to our team about institutional IRB approvals, air-gapped hospital installs, and custom EEG hardware SDKs (OpenBCI, g.tec, Brain Products).
          </p>
        </div>
        <button
          onClick={onStartFree}
          className="btn btn-secondary"
          style={{ whiteSpace: 'nowrap', borderRadius: '8px', fontSize: '0.84rem' }}
        >
          Contact research team
        </button>
      </SpotlightCard>
    </section>
  );
}
