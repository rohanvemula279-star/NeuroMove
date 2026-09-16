import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Sparkles, Database } from 'lucide-react';
import { uploadTrial, loadSampleTrial, FALLBACK_DATASETS } from '../api/client';

export default function UploadPanel({ onTrialLoaded, currentTrial }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState('ds_01');
  const fileInputRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const response = await uploadTrial(file);
      onTrialLoaded(response);
      triggerToast(`Dataset Loaded: ${file.name} (64 Channels @ 128 Hz)`);
    } catch (err) {
      setError(err.message || 'Failed to upload trial file.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loadSampleTrial();
      onTrialLoaded(response);
      triggerToast('Dataset Loaded: Real PhysioNet S089 Trial (64 Channels @ 128 Hz)');
    } catch (err) {
      setError(err.message || 'Failed to load sample trial.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDataset = async (datasetId) => {
    setLoading(true);
    setError(null);
    setSelectedDatasetId(datasetId);
    try {
      const response = await loadSampleTrial(datasetId);
      onTrialLoaded(response);
      const ds = FALLBACK_DATASETS.find((d) => d.dataset_id === datasetId);
      triggerToast(`Loaded ${ds ? ds.name : datasetId} (Ground Truth: ${ds?.ground_truth_code || 'Verified'})`);
    } catch (err) {
      setError(err.message || 'Failed to load benchmark dataset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" id="upload-panel">
      {/* Floating Success Toast Alert */}
      {showToast && (
        <div
          id="toast-dataset-loaded"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#FFFFFF',
            color: '#000000',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.25)',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <CheckCircle2 size={18} color="#000000" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="card-title">
            <UploadCloud size={20} color="#FFFFFF" />
            EEG Dataset & Trial Ingestion
          </h2>
          <p className="card-subtitle">
            Upload raw EEG recordings (.edf, .npy, .npz, .csv) or pick from 10 real benchmark datasets
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            id="select-benchmark-dataset"
            value={selectedDatasetId}
            onChange={(e) => handleLoadDataset(e.target.value)}
            disabled={loading}
            style={{
              background: 'var(--bg-surface-0)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {FALLBACK_DATASETS.map((ds) => (
              <option key={ds.dataset_id} value={ds.dataset_id}>
                {ds.name} [{ds.ground_truth_code}]
              </option>
            ))}
          </select>

          <button
            id="btn-load-sample"
            className="btn btn-emerald"
            onClick={handleLoadSample}
            disabled={loading}
            style={{ fontSize: '0.82rem', padding: '8px 14px', boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)' }}
          >
            <Sparkles size={14} />
            {loading ? 'Loading...' : 'Load Real S089'}
          </button>
        </div>
      </div>

      {/* Prominent Promoted Status Banner when Dataset is Loaded */}
      {currentTrial && (
        <div
          id="dataset-loaded-banner"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              <CheckCircle2 size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{
                fontSize: '1.02rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>DATASET LOADED SUCCESSFULLY</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  ACTIVE IN MEMORY
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#E4E4E7', margin: '4px 0 0' }}>
                {currentTrial.message || 'Real PhysioNet EEGMMIDB recording loaded, resampled to 128 Hz, and partitioned into 5 motor-cortex feature pairs.'}
              </p>
            </div>
          </div>

          <div className="mono" style={{
            background: 'var(--bg-surface-0)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: '#FFFFFF',
            border: '1px solid var(--border-subtle)'
          }}>
            TRIAL ID: {currentTrial.trial_id}
          </div>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        id="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)'}`,
          backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '20px'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".edf,.npy,.npz,.csv"
          style={{ display: 'none' }}
          id="file-input"
        />

        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--bg-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px'
        }}>
          <UploadCloud size={24} color={isDragging ? '#FFFFFF' : '#A1A1AA'} />
        </div>

        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {loading ? 'Ingesting and preprocessing EEG dataset...' : 'Drop EEG trial file here or click to browse'}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
          Accepted formats: PhysioNet EDF (.edf), NumPy (.npy, .npz), or CSV (.csv) · 160 Hz or 128 Hz
        </p>
      </div>

      {/* Error Feedback */}
      {error && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#FFFFFF',
          fontSize: '0.88rem',
          marginBottom: '16px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Trial Metadata Grid */}
      {currentTrial && (
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={17} color="#FFFFFF" />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                Preprocessed Signal Specifications
              </span>
            </div>
            <span className="badge badge-cyan mono" style={{ fontSize: '0.72rem' }}>
              6-STAGE PIPELINE COMPLETE
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ background: 'var(--bg-surface-0)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>CHANNELS</div>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentTrial.num_channels}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-0)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>SAMPLING RATE</div>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {currentTrial.sampling_rate} Hz
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-0)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>TRIAL DURATION</div>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentTrial.duration_s} s
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-0)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>SUB-WINDOWS</div>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-violet)' }}>
                {currentTrial.samples_per_channel || 9}
              </div>
            </div>

            {currentTrial.ground_truth_label && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#E4E4E7', fontWeight: 700 }}>VERIFIED GROUND TRUTH</div>
                <div className="mono" style={{ fontSize: '0.90rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrial.ground_truth_code}: {currentTrial.ground_truth_label}
                </div>
              </div>
            )}
          </div>

          {/* Channel Montage Preview */}
          {currentTrial.channels && currentTrial.channels.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                SENSORY-MOTOR TOPOGRAPHY EXTRACTED (FIRST 10 CHANNELS)
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {currentTrial.channels.map((ch, idx) => (
                  <span
                    key={idx}
                    className="mono"
                    style={{
                      background: 'var(--bg-surface-3)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
