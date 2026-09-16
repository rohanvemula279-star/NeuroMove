import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import SpotlightCard from './effects/SpotlightCard';

/**
 * FaqSection
 * Section: Frequently asked questions (accordion style)
 */
export default function FaqSection({ onContactTeam }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What is NeuroMove?',
      a: 'NeuroMove is a production-grade 4-class Motor Imagery EEG classification system and transparency benchmark based on Hwaidi & Ghanem (NeuroImage 328, 2026). It extracts 5 bipolar electrode pairs along the sensorimotor cortex, applies 8–30 Hz Butterworth bandpass filtering, and utilizes a closed-form MiniRocket + Ridge regression pipeline achieving 95.80% total test accuracy.',
    },
    {
      q: 'Why did CNN-LSTM collapse to 29.96% while MiniRocket reached 95.80%?',
      a: 'Deep neural networks like CNN-LSTM rely on stochastic gradient descent and require vast sample sizes to avoid temporal memorization. On scalp EEG, non-stationarity causes CNN-LSTM to severely overfit noise, dropping to near-chance (29.96%). In contrast, MiniRocket projects signals across 10,000 diverse random convolutional kernels and computes proportion-of-positive-values (PPV), followed by a deterministic, closed-form L2 Ridge solver that avoids overfitting.',
    },
    {
      q: 'What is zero-leakage evaluation and why is it critical?',
      a: 'In traditional machine learning literature, trials are often sliced into overlapping time windows before splitting into train and test sets. This creates severe temporal leakage where identical brain states contaminate the test partition, fabricating fake 99% scores. NeuroMove strictly splits at the whole-trial level (10-fold stratified CV), guaranteeing zero sub-window data leakage.',
    },
    {
      q: 'What are the 5 motor-cortex differential electrode pairs?',
      a: 'The 5 bipolar channels are: C3-C4 (Primary hand motor strip / contralateral hand rhythm), C1-C2 (Medial sensorimotor strip / proximal limb control), FC3-FC4 (Premotor cortex & SMA / motor planning), CP3-CP4 (Centroparietal somatosensory / kinesthetic feedback), and C5-C6 (Lateral sensorimotor strip). Together, they capture the spatial gradient of event-related desynchronization (ERD) without requiring a 64-channel full cap.',
    },
    {
      q: 'Can NeuroMove run in real-time on standard consumer hardware?',
      a: 'Yes. Because the MiniRocket convolutional feature projection and Ridge regression model are closed-form and CPU-vectorized, inference requires only 6.1 milliseconds per 4-second signal window (~163 Hz continuous decision rate). It runs with zero latency on standard laptops or embedded clinical hardware without requiring dedicated GPUs.',
    },
  ];

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="faq-section" style={{ margin: '64px 0' }}>
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
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Clear Documentation
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              margin: '8px 0 0 0',
            }}
          >
            Frequently asked questions
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#A1A1AA', marginTop: '10px' }}>
            Everything you need to know about deploying NeuroMove. Can’t find an answer? Our research team is one message away.
          </p>
        </div>

        <button
          onClick={onContactTeam}
          className="btn btn-secondary"
          style={{
            borderRadius: '8px',
            fontSize: '0.84rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#FFFFFF',
          }}
        >
          Talk to our team
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <SpotlightCard
              key={idx}
              spotlightColor="rgba(255, 255, 255, 0.08)"
              borderColor={isOpen ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.1)'}
              style={{
                padding: '20px 24px',
                cursor: 'pointer',
              }}
              onClick={() => toggleFaq(idx)}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={17} color={isOpen ? '#FFFFFF' : '#71717A'} />
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: isOpen ? '#FFFFFF' : '#EDEDED' }}>
                    {faq.q}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={18} color="#FFFFFF" /> : <ChevronDown size={18} color="#A1A1AA" />}
              </div>

              {isOpen && (
                <div
                  style={{
                    marginTop: '14px',
                    paddingTop: '14px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.88rem',
                    color: '#A1A1AA',
                    lineHeight: 1.65,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
