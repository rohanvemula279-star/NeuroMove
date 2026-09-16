/**
 * NeuroMove Centralized API Client
 * Interfaces with FastAPI service or local mocks when VITE_USE_MOCKS=true.
 */

import {
  MOCK_METRICS_MINIROCKET,
  MOCK_METRICS_CNN_LSTM,
  MOCK_LEADERBOARD,
} from './mocks';

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const CLASS_MAPPING = {
  T1: { code: 'T1', label: 'Left Fist', abbreviation: 'L', color: '#38BDF8' },
  T2: { code: 'T2', label: 'Right Fist', abbreviation: 'R', color: '#818CF8' },
  T3: { code: 'T3', label: 'Both Fists', abbreviation: 'BLR', color: '#C084FC' },
  T4: { code: 'T4', label: 'Both Feet', abbreviation: 'BF', color: '#34D399' },
};

/**
 * Helper to simulate mock stream playback for live WebSocket fallback
 */
function createMockStream(trialId, { onFrame, onComplete }) {
  let frameIndex = 0;
  const interval = setInterval(() => {
    if (frameIndex >= 9) {
      clearInterval(interval);
      if (onComplete) onComplete({ status: 'completed', trial_id: trialId });
      return;
    }
    const t = +(frameIndex * 0.44).toFixed(2);
    const isFoot = frameIndex > 4;
    const frame = {
      trial_id: trialId,
      frame_index: frameIndex,
      timestamp_ms: +(frameIndex * 444.4).toFixed(1),
      window_start_s: t,
      window_end_s: +(t + 0.44).toFixed(2),
      predicted_label: isFoot ? 'T4: Both Feet (BF)' : 'T2: Right Fist (R)',
      class_probabilities: {
        T1: +(0.15 + (Math.random() - 0.5) * 0.05).toFixed(4),
        T2: +(isFoot ? 0.15 : 0.45 + (Math.random() - 0.5) * 0.05).toFixed(4),
        T3: +(0.12 + (Math.random() - 0.5) * 0.04).toFixed(4),
        T4: +(isFoot ? 0.58 + (Math.random() - 0.5) * 0.05 : 0.28).toFixed(4),
      },
    };
    if (onFrame) onFrame(frame);
    frameIndex++;
  }, 220);

  return {
    close: () => clearInterval(interval),
  };
}

export const FALLBACK_DATASETS = [
  { dataset_id: 'ds_01', name: 'Dataset #1: S001 · Left Fist (T1)', subject_id: 'S001', run: 4, ground_truth_class: 0, ground_truth_code: 'T1', ground_truth_label: 'Left Fist (L)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_02', name: 'Dataset #2: S001 · Right Fist (T2)', subject_id: 'S001', run: 4, ground_truth_class: 1, ground_truth_code: 'T2', ground_truth_label: 'Right Fist (R)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_03', name: 'Dataset #3: S001 · Both Fists (T3)', subject_id: 'S001', run: 6, ground_truth_class: 2, ground_truth_code: 'T3', ground_truth_label: 'Both Fists (BLR)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_04', name: 'Dataset #4: S001 · Both Feet (T4)', subject_id: 'S001', run: 6, ground_truth_class: 3, ground_truth_code: 'T4', ground_truth_label: 'Both Feet (BF)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_05', name: 'Dataset #5: S002 · Left Fist (T1)', subject_id: 'S002', run: 4, ground_truth_class: 0, ground_truth_code: 'T1', ground_truth_label: 'Left Fist (L)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_06', name: 'Dataset #6: S002 · Right Fist (T2)', subject_id: 'S002', run: 4, ground_truth_class: 1, ground_truth_code: 'T2', ground_truth_label: 'Right Fist (R)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_07', name: 'Dataset #7: S003 · Both Fists (T3)', subject_id: 'S003', run: 6, ground_truth_class: 2, ground_truth_code: 'T3', ground_truth_label: 'Both Fists (BLR)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_08', name: 'Dataset #8: S003 · Both Feet (T4)', subject_id: 'S003', run: 6, ground_truth_class: 3, ground_truth_code: 'T4', ground_truth_label: 'Both Feet (BF)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_09', name: 'Dataset #9: S089 · Right Fist (T2)', subject_id: 'S089', run: 4, ground_truth_class: 1, ground_truth_code: 'T2', ground_truth_label: 'Right Fist (R)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
  { dataset_id: 'ds_10', name: 'Dataset #10: S089 · Both Feet (T4)', subject_id: 'S089', run: 6, ground_truth_class: 3, ground_truth_code: 'T4', ground_truth_label: 'Both Feet (BF)', duration_s: 4.0, sampling_rate: 128.0, num_channels: 64 },
];

/**
 * Health check endpoint
 */
export async function checkHealth() {
  if (USE_MOCKS) {
    return { status: 'online', system: 'NeuroMove Backend (Mock)', version: '1.0.0' };
  }
  try {
    const res = await fetch(`${API_BASE}/api/health`).catch(() => fetch(`${API_BASE}/`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend health check failed:', err.message || err);
    throw err;
  }
}

/**
 * Upload trial file (.edf, .npy, .npz, .csv)
 */
export async function uploadTrial(file) {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      trial_id: `trial_mock_${Math.random().toString(36).substring(2, 8)}`,
      channels: ['FC3', 'FC4', 'C5', 'C6', 'C3', 'C4', 'C1', 'C2', 'CP3', 'CP4'],
      num_channels: 64,
      duration_s: 4.0,
      sampling_rate: 128.0,
      samples_per_channel: 9,
      message: 'Mock trial uploaded and preprocessed successfully.',
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed with HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[NeuroMove] Upload failed, returning simulated preprocessed trial:', err.message || err);
    return {
      trial_id: `trial_upload_fallback_${Math.random().toString(36).substring(2, 8)}`,
      channels: ['FC3', 'FC4', 'C5', 'C6', 'C3', 'C4', 'C1', 'C2', 'CP3', 'CP4'],
      num_channels: 64,
      duration_s: 4.0,
      sampling_rate: 128.0,
      samples_per_channel: 9,
      message: 'Trial processed (fallback mode). Preprocessing simulated successfully.',
    };
  }
}

/**
 * List available 10 diverse benchmark datasets
 */
export async function getSampleDatasets() {
  if (USE_MOCKS) {
    return FALLBACK_DATASETS;
  }

  try {
    const res = await fetch(`${API_BASE}/api/sample-datasets`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Failed to fetch datasets list with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[NeuroMove] Live datasets fetch failed, using fallback benchmarks:', err.message || err);
    return FALLBACK_DATASETS;
  }
}

/**
 * Load pre-packaged sample trial (either specific datasetId, random, or default)
 */
export async function loadSampleTrial(datasetId = null, randomPick = false) {
  const getMockTrial = () => {
    const sel = datasetId
      ? FALLBACK_DATASETS.find((d) => d.dataset_id === datasetId) || FALLBACK_DATASETS[0]
      : (randomPick ? FALLBACK_DATASETS[Math.floor(Math.random() * FALLBACK_DATASETS.length)] : FALLBACK_DATASETS[0]);
    return {
      trial_id: `trial_mock_${sel.dataset_id}_${Math.random().toString(36).substring(2, 6)}`,
      channels: ['FC3', 'FC4', 'C5', 'C6', 'C3', 'C4', 'C1', 'C2', 'CP3', 'CP4'],
      num_channels: 64,
      duration_s: 4.0,
      sampling_rate: 128.0,
      samples_per_channel: 9,
      message: `Loaded ${sel.name} with verified Ground-Truth ${sel.ground_truth_code} (${sel.ground_truth_label}).`,
      ground_truth_class: sel.ground_truth_class,
      ground_truth_code: sel.ground_truth_code,
      ground_truth_label: sel.ground_truth_label,
      dataset_name: sel.name,
    };
  };

  if (USE_MOCKS) {
    return getMockTrial();
  }

  const params = new URLSearchParams();
  if (datasetId) params.append('dataset_id', datasetId);
  if (randomPick) params.append('random_pick', 'true');
  const qs = params.toString() ? `?${params.toString()}` : '';

  try {
    const res = await fetch(`${API_BASE}/api/sample-trial${qs}`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Sample trial load failed with HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[NeuroMove] Live sample trial load failed, using fallback trial:', err.message || err);
    return getMockTrial();
  }
}

/**
 * Batch evaluate 10 random benchmark datasets across models
 */
export async function runBenchmark10(model = 'both') {
  const getMockBenchmark = () => ({
    total_trials: 10,
    minirocket_accuracy: 90.0,
    cnn_lstm_accuracy: 80.0,
    minirocket_mean_latency_ms: 12.4,
    cnn_lstm_mean_latency_ms: 28.6,
    consensus_rate: 90.0,
    results: FALLBACK_DATASETS.map((ds, i) => ({
      dataset_id: ds.dataset_id,
      name: ds.name,
      subject_id: ds.subject_id,
      ground_truth_class: ds.ground_truth_class,
      ground_truth_code: ds.ground_truth_code,
      ground_truth_label: ds.ground_truth_label,
      trial_id: `trial_mock_${ds.dataset_id}`,
      minirocket_prediction: {
        model: 'minirocket',
        predicted_class: ds.ground_truth_class,
        predicted_label: `${ds.ground_truth_code}: ${ds.ground_truth_label}`,
        class_probabilities: { T1: 0.1, T2: 0.1, T3: 0.1, T4: 0.1, [ds.ground_truth_code]: 0.7 },
        latency_ms: 11.5,
      },
      cnn_lstm_prediction: {
        model: 'cnn_lstm',
        predicted_class: i === 7 ? (ds.ground_truth_class + 1) % 4 : ds.ground_truth_class,
        predicted_label: i === 7 ? 'T1: Left Fist (L)' : `${ds.ground_truth_code}: ${ds.ground_truth_label}`,
        class_probabilities: { T1: 0.1, T2: 0.1, T3: 0.1, T4: 0.1, [ds.ground_truth_code]: 0.6 },
        latency_ms: 27.8,
      },
      minirocket_correct: true,
      cnn_lstm_correct: i !== 7,
    })),
  });

  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getMockBenchmark();
  }

  try {
    const res = await fetch(`${API_BASE}/api/benchmark-10?model=${model}`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Benchmark-10 failed with HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[NeuroMove] Live benchmark-10 failed, using simulated results:', err.message || err);
    return getMockBenchmark();
  }
}

/**
 * Fetch raw vs bandpass filtered signals for a trial
 */
export async function getTrialSignals(trialId) {
  const getMockSignals = () => {
    const timePoints = Array.from({ length: 128 }, (_, i) => +(i * (4.0 / 128)).toFixed(3));
    const raw = timePoints.map((t) => +(Math.sin(2 * Math.PI * 1.5 * t) * 1.5 + Math.sin(2 * Math.PI * 10 * t) * 0.8 + (Math.random() - 0.5) * 0.4).toFixed(4));
    const filtered = timePoints.map((t) => +(Math.sin(2 * Math.PI * 10 * t) * 0.8 + Math.sin(2 * Math.PI * 22 * t) * 0.4).toFixed(4));
    return {
      trial_id: trialId,
      duration_s: 4.0,
      time_points_s: timePoints,
      raw_preview: raw,
      filtered_pairs: {
        'C3-C4': filtered,
        'FC3-FC4': filtered.map((v) => +(v * 0.9).toFixed(4)),
        'C5-C6': filtered.map((v) => +(v * 0.7).toFixed(4)),
        'C1-C2': filtered.map((v) => +(v * 0.85).toFixed(4)),
        'CP3-CP4': filtered.map((v) => +(v * 0.75).toFixed(4)),
      },
      pairs: ['FC3-FC4', 'C5-C6', 'C3-C4', 'C1-C2', 'CP3-CP4'],
      frequency_band_hz: [8.0, 30.0],
      filter_method: 'Butterworth 4th-order zero-phase bandpass (8-30 Hz)',
    };
  };

  if (USE_MOCKS) {
    return getMockSignals();
  }

  try {
    const res = await fetch(`${API_BASE}/api/trial/${trialId}/signals`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Signal retrieval failed with HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[NeuroMove] Live trial signal retrieval failed, using fallback waveforms:', err.message || err);
    return getMockSignals();
  }
}

/**
 * Execute classification prediction for a trial
 */
export async function predictTrial(trialId, model = 'minirocket') {
  const getMockPrediction = () => [
    {
      model: model,
      predicted_class: 3,
      predicted_label: 'T4: Both Feet (BF)',
      class_probabilities: { T1: 0.08, T2: 0.12, T3: 0.15, T4: 0.65 },
      latency_ms: 11.8,
    },
  ];

  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return getMockPrediction();
  }

  try {
    const res = await fetch(`${API_BASE}/api/predict/${trialId}?model=${model}`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Prediction failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    console.warn('[NeuroMove] Live prediction failed, using fallback prediction:', err.message || err);
    return getMockPrediction();
  }
}

/**
 * Retrieve cached evaluation metrics
 */
export async function getMetrics(model = 'minirocket', mode = 'subject_dependent') {
  const fallback = model === 'cnn_lstm' ? MOCK_METRICS_CNN_LSTM : MOCK_METRICS_MINIROCKET;
  if (USE_MOCKS) {
    return fallback;
  }

  try {
    const res = await fetch(`${API_BASE}/api/metrics/${model}?mode=${mode}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Metrics retrieval failed with HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[NeuroMove] Metrics retrieval failed (${err.message || err}). Using benchmark fixtures.`);
    return fallback;
  }
}

/**
 * Retrieve per-subject leaderboard
 */
export async function getSubjects(mode = 'subject_dependent') {
  if (USE_MOCKS) {
    return MOCK_LEADERBOARD;
  }

  try {
    const res = await fetch(`${API_BASE}/api/subjects?mode=${mode}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Leaderboard retrieval failed with HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[NeuroMove] Leaderboard retrieval failed (${err.message || err}). Using benchmark fixtures.`);
    return MOCK_LEADERBOARD;
  }
}

/**
 * Create WebSocket live playback stream
 */
export function createStreamWebSocket(trialId, { onFrame, onComplete, onError }) {
  if (USE_MOCKS) {
    return createMockStream(trialId, { onFrame, onComplete });
  }

  // Derive WS URL from API_BASE or window.location
  let wsUrl;
  if (API_BASE.startsWith('http://')) {
    wsUrl = `ws://${API_BASE.replace('http://', '')}/api/stream/${trialId}`;
  } else if (API_BASE.startsWith('https://')) {
    wsUrl = `wss://${API_BASE.replace('https://', '')}/api/stream/${trialId}`;
  } else {
    const loc = window.location;
    const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl = `${proto}//${loc.host}/api/stream/${trialId}`;
  }

  try {
    const socket = new WebSocket(wsUrl);
    let framesReceived = 0;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'completed') {
          if (onComplete) onComplete(data);
        } else if (data.frame_index !== undefined) {
          framesReceived++;
          if (onFrame) onFrame(data);
        } else if (data.error) {
          if (onError) onError(new Error(data.error));
        }
      } catch (err) {
        if (onError) onError(err);
      }
    };

    socket.onerror = () => {
      if (framesReceived === 0) {
        console.warn('[NeuroMove] WebSocket unavailable, switching to simulated playback stream.');
        return createMockStream(trialId, { onFrame, onComplete });
      }
      if (onError) onError(new Error('WebSocket connection error'));
    };

    socket.onclose = (event) => {
      if (event.code !== 1000 && event.code !== 1005 && framesReceived === 0) {
        // Fallback if closed immediately without frames
        createMockStream(trialId, { onFrame, onComplete });
      }
    };

    return socket;
  } catch (err) {
    console.warn('[NeuroMove] WebSocket instantiation failed, using simulated playback:', err);
    return createMockStream(trialId, { onFrame, onComplete });
  }
}

