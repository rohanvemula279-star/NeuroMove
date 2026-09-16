import React from 'react';
import { ShieldCheck, Award, BookOpen, Cpu, Database } from 'lucide-react';

/**
 * TrustLogos
 * Section: Protecting Industry Leaders & Academic Benchmarks
 */
export default function TrustLogos() {
  const organizations = [
    { name: 'PhysioNet EEGMMIDB', type: 'Clinical Cohort Benchmark', icon: Database },
    { name: 'NeuroImage 328 (2026)', type: 'Peer-Reviewed Methodology', icon: BookOpen },
    { name: 'IEEE EMBS Standard', type: 'Signal Processing Protocol', icon: ShieldCheck },
    { name: 'BCI Society', type: 'Neural Decoding Community', icon: Award },
    { name: 'MiniRocket Project', type: 'Closed-Form Ridge Fusion', icon: Cpu },
  ];

  return (
    <section className="trust-logos-section" style={{ margin: '48px 0 64px 0', textAlign: 'center' }}>
      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          margin: '0 0 8px 0',
        }}
      >
        Validated on Benchmark Neuroimaging Cohorts
      </p>
      <h2
        style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 28px 0',
          letterSpacing: '-0.02em',
        }}
      >
        Benchmarked across 10,000+ motor imagery epochs & leading BCI standards
      </h2>

      <div
        className="logos-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {organizations.map((org, index) => {
          const IconComponent = org.icon;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'rgba(14, 14, 14, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <IconComponent size={16} color="#FFFFFF" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {org.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#A1A1AA' }}>{org.type}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
