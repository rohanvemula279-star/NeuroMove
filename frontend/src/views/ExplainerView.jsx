import React from 'react';
import SignalExplainer from '../components/SignalExplainer';

export default function ExplainerView({ currentTrial }) {
  return (
    <div>
      <SignalExplainer currentTrial={currentTrial} />
    </div>
  );
}
