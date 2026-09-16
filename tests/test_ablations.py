"""Unit tests for Preprocessing Ablation options and CSP+LDA baseline.
"""

import numpy as np
import pytest
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from mne.decoding import CSP

from app.data.preprocessing import (
    EEGPreprocessor,
    MOTOR_CORTEX_PAIRS,
    MOTOR_CORTEX_21,
    bandpass_filter,
)


def test_bandpass_filter_direct():
    # 64 channels x 640 timepoints (4s at 160Hz)
    raw = np.random.randn(64, 512).astype(np.float32)
    filtered = bandpass_filter(raw, fs=128.0, l_freq=8.0, h_freq=30.0, order=4)
    assert filtered.shape == raw.shape
    assert not np.isnan(filtered).any()
    assert not np.isinf(filtered).any()


def test_eeg_preprocessor_bandpass_c3_c4():
    raw_64 = np.random.randn(64, 640).astype(np.float32)
    ch_names = [f"Ch{i}" for i in range(64)]
    ch_names[8] = "C3.."
    ch_names[12] = "C4.."

    preproc = EEGPreprocessor(filter_method="bandpass", channel_mode="c3_c4", samples_per_trial=9)
    samples, pair_dict = preproc.preprocess_trial(raw_64, ch_names)

    assert samples.shape == (9, 512)
    assert not np.isnan(samples).any()
    assert "C3-C4" in pair_dict


def test_eeg_preprocessor_bandpass_5_pairs():
    raw_64 = np.random.randn(64, 640).astype(np.float32)
    ch_names = [f"Ch{i}" for i in range(64)]

    preproc = EEGPreprocessor(filter_method="bandpass", channel_mode="5_pairs", samples_per_trial=9)
    samples, pair_dict = preproc.preprocess_trial(raw_64, ch_names)

    # 5 pairs * (256 + 256) = 2560
    assert samples.shape == (9, 2560)
    assert not np.isnan(samples).any()


def test_eeg_preprocessor_bandpass_motor_cortex_21():
    raw_64 = np.random.randn(64, 640).astype(np.float32)
    ch_names = [f"Ch{i}" for i in range(64)]
    # Assign some motor cortex names
    for i, ch in enumerate(MOTOR_CORTEX_21[:10]):
        ch_names[i] = ch

    preproc = EEGPreprocessor(filter_method="bandpass", channel_mode="motor_cortex", samples_per_trial=9)
    samples, _ = preproc.preprocess_trial(raw_64, ch_names)

    # 21 channels * 256 samples = 5376
    assert samples.shape == (9, 21 * 256)
    assert not np.isnan(samples).any()


def test_eeg_preprocessor_full_trial_for_csp():
    raw_64 = np.random.randn(64, 640).astype(np.float32)
    ch_names = [f"Ch{i}" for i in range(64)]

    preproc = EEGPreprocessor(filter_method="bandpass")
    full = preproc.preprocess_full_trial(raw_64, ch_names)

    # Resampled 640 at 160Hz -> 512 at 128Hz
    assert full.shape == (64, 512)
    assert not np.isnan(full).any()


def test_csp_lda_multiclass_pipeline():
    # 20 trials, 16 channels, 512 timepoints
    n_trials = 20
    X = np.random.randn(n_trials, 16, 512).astype(np.float64)
    y = np.array([i % 4 for i in range(n_trials)], dtype=np.int64)

    csp = CSP(n_components=4, log=True, cov_est="concat")
    X_csp = csp.fit_transform(X, y)
    assert X_csp.shape == (n_trials, 4)

    lda = LinearDiscriminantAnalysis()
    lda.fit(X_csp, y)
    preds = lda.predict(X_csp)
    assert len(preds) == n_trials
    assert set(preds).issubset({0, 1, 2, 3})
