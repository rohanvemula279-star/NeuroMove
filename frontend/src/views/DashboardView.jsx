import React from 'react';
import AccuracyStoryPanel from '../components/AccuracyStoryPanel';
import TrustLogos from '../components/TrustLogos';
import ValueProposition from '../components/ValueProposition';
import MetricCards from '../components/MetricCards';
import ChallengeSection from '../components/ChallengeSection';
import SanityCheckBadge from '../components/SanityCheckBadge';
import ConfusionMatrix from '../components/ConfusionMatrix';
import RocChart from '../components/RocChart';
import ClassBreakdownChart from '../components/ClassBreakdownChart';
import TestimonialSection from '../components/TestimonialSection';
import CaseStudySection from '../components/CaseStudySection';
import FinalCtaSection from '../components/FinalCtaSection';

export default function DashboardView({
  metrics,
  loading,
  error,
  onLaunchLive,
  onExploreLeaderboard,
  onExploreExplainer,
}) {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ color: 'var(--midnight-blue)', fontWeight: 600, fontSize: '1.1rem' }}>
          Loading live evaluation benchmarks from backend...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          background: 'rgba(244, 63, 94, 0.08)',
        }}
      >
        <div style={{ color: 'var(--accent-rose)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
          Unable to Load Live Metrics
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* 1. Above-the-fold Accuracy Story & Transparency Benchmark */}
      <AccuracyStoryPanel />

      {/* 2. Trust & Academic Benchmark Logos */}
      <TrustLogos />

      {/* 3. Value Proposition: 3 Core Capability Modules */}
      <ValueProposition />

      {/* 4. Asymmetric Bento Grid Metrics (95.80% Acc, 6.1ms, 46.2% Floor) */}
      <MetricCards metrics={metrics} />

      {/* 5. The Challenge Section: Data Leakage & Overfitting Pitfalls */}
      <ChallengeSection />

      {/* 6. Automated Sanity Check Badge */}
      <SanityCheckBadge sanityCheck={metrics?.sanity_check} />

      {/* 7. Empirical Validation: Confusion Matrix & ROC Curves */}
      <div className="grid-2">
        <ConfusionMatrix matrix={metrics?.confusion_matrix} />
        <RocChart
          rocCurves={metrics?.roc_curves}
          rocAuc={metrics?.roc_auc}
        />
      </div>

      {/* 8. Neurophysiological Asymmetry Breakdown */}
      <ClassBreakdownChart perClassMetrics={metrics?.per_class_metrics} />

      {/* 9. Testimonial Section: NeuroImage 2026 Investigators */}
      <TestimonialSection />

      {/* 10. Case Study Highlight: S002 Cohort (97.59% Acc) */}
      <CaseStudySection onExploreLeaderboard={onExploreLeaderboard} />

      {/* 11. Final CTA Banner */}
      <FinalCtaSection onLaunchLive={onLaunchLive} onContactTeam={onExploreExplainer} />
    </div>
  );
}
