import React from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import StarBorder from './effects/StarBorder';

/**
 * FinalCtaSection
 * Section: Final CTA / Footer Hero matching Sentinel structure
 */
export default function FinalCtaSection({ onLaunchLive, onContactTeam }) {
  return (
    <section
      className="final-cta-section"
      style={{
        margin: '80px 0 32px 0',
        padding: '64px 32px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(16, 16, 16, 0.9) 0%, rgba(5, 5, 5, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
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
          Production-Ready BCI
        </span>
        <h2
          style={{
            fontSize: 'clamp(2rem, 3.8vw, 3rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.035em',
            margin: '12px 0 16px 0',
            lineHeight: 1.15,
          }}
        >
          Take control of every neural signal across your lab
        </h2>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#A1A1AA',
            lineHeight: 1.65,
            maxWidth: '640px',
            margin: '0 auto 32px auto',
          }}
        >
          Unify preprocessing, 5-pair motor cortex spatial fusion, and verified zero-leakage evaluation on one platform —
          and give your research team an authoritative standard from day one.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <StarBorder
            as="button"
            onClick={onLaunchLive}
            color="#FFFFFF"
            speed="3.2s"
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: '#FFFFFF',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.94rem',
                borderRadius: '9999px',
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
              }}
            >
              <Play size={15} fill="#000000" color="#000000" />
              <span>Launch Live Playback</span>
            </div>
          </StarBorder>

          <button
            onClick={onContactTeam}
            className="btn btn-secondary"
            style={{
              padding: '13px 24px',
              borderRadius: '9999px',
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
            }}
          >
            <span>Consult Methodology Docs</span>
            <ArrowUpRight size={15} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </section>
  );
}
