import React from 'react';
import SubjectLeaderboard from '../components/SubjectLeaderboard';

export default function LeaderboardView({ leaderboardData, metricsData, loading, error }) {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '1.1rem' }}>
          Loading 5-subject leaderboard from backend...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{
        textAlign: 'center',
        padding: '40px 20px',
        border: '1px solid rgba(244, 63, 94, 0.4)',
        background: 'rgba(244, 63, 94, 0.08)'
      }}>
        <div style={{ color: 'var(--accent-rose)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
          Unable to Load Subject Leaderboard
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <SubjectLeaderboard
        leaderboardData={leaderboardData}
        metricsData={metricsData}
      />
    </div>
  );
}
