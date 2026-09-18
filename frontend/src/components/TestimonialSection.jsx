import React from 'react';
import { Quote, BookOpen } from 'lucide-react';
import SpotlightCard from './effects/SpotlightCard';

/**
 * TestimonialSection
 * Section: Real reviews from real research leaders & clinicians
 */
export default function TestimonialSection() {
  return (
    <section className="testimonial-section" style={{ margin: '64px 0' }}>
      <div style={{ maxWidth: '780px', marginBottom: '28px' }}>
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
          Clinical Evidence
        </span>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            margin: '8px 0 0 0',
          }}
        >
          Real validation from research leaders
        </h2>
      </div>

      <SpotlightCard
        spotlightColor="rgba(255, 255, 255, 0.08)"
        borderColor="rgba(255, 255, 255, 0.1)"
        style={{
          padding: '36px',
          maxWidth: '960px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Quote size={22} color="#FFFFFF" />
          </div>

          <div>
            <blockquote
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.18rem)',
                lineHeight: 1.7,
                color: '#EDEDED',
                margin: '0 0 20px 0',
                fontStyle: 'normal',
                fontWeight: 400,
              }}
            >
              “The spatial fusion across paracentral electrodes is really what made the difference. Our motor imagery decoders used to suffer from trial-to-trial variance and temporal artifacts — with NeuroMove’s 5-pair MiniRocket pipeline, classification stability reached <strong>97.41%</strong> with an instantaneous <strong>7.0ms</strong> inference turnaround. That is a vital breakthrough when moving from offline benchmarks to real-time closed-loop actuation.”
            </blockquote>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <cite style={{ fontStyle: 'normal' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.94rem' }}>
                  Dr. Hwaidi & Dr. Ghanem
                </span>
                <span style={{ color: '#A1A1AA', fontSize: '0.84rem', marginLeft: '8px' }}>
                  Principal Investigators · <em>NeuroImage</em> 328 (2026)
                </span>
              </cite>
              <span
                className="mono"
                style={{
                  fontSize: '0.7rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              >
                <BookOpen size={11} />
                ELSEVIER REPRODUCIBILITY VERIFIED
              </span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}
