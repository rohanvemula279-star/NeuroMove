import React from 'react';
import UploadPanel from '../components/UploadPanel';
import ModelSelector from '../components/ModelSelector';
import LivePlaybackView from '../components/LivePlaybackView';

export default function LiveView({
  currentTrial,
  onTrialLoaded,
  selectedModel,
  onSelectModel,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Split: Ingestion + Model Selection */}
      <div className="grid-2">
        <UploadPanel
          currentTrial={currentTrial}
          onTrialLoaded={onTrialLoaded}
        />
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>

      {/* Live Playback View */}
      <LivePlaybackView
        currentTrial={currentTrial}
        selectedModel={selectedModel}
        onTrialLoaded={onTrialLoaded}
      />
    </div>
  );
}
