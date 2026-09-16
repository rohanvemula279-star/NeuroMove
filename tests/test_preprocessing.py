"""Unit tests for EEG Preprocessing Pipeline.
Tests resampling, CAR re-referencing, ICA band isolation, symmetric pair concatenation,
and zero data-leakage across 5:2:3 splits.
"""

import numpy as np
import pytest
from app.data.preprocessing import (
    MOTOR_CORTEX_PAIRS,
    apply_common_average_reference,
    apply_ica_band_isolation,
    augment_training_samples,
    extract_electrode_pairs,
    extract_trial_samples,
    partition_dataset,
    resample_signal,
    EEGPreprocessor,
)
from app.data.loader import CLEAN_64_CHANNELS, PhysioNetLoader


def test_resample_ratio_4_5():
    """Verify anti-alias polyphase resampling converts 160 Hz (640 samples for 4s)
    to exactly 128 Hz (512 samples for 4s) at 4:5 ratio.
    """
    n_channels = 64
    orig_samples = 640  # 4 seconds at 160 Hz
    t = np.linspace(0, 4.0, orig_samples, endpoint=False)
    # 10 Hz sine wave
    raw = np.tile(np.sin(2 * np.pi * 10.0 * t), (n_channels, 1))

    resampled = resample_signal(raw, orig_fs=160.0, target_fs=128.0)
    assert resampled.shape == (n_channels, 512)
    assert resampled.dtype == np.float32


def test_common_average_reference():
    """Verify CAR re-references across channels so average at any timepoint is zero."""
    n_channels = 64
    n_samples = 512
    rng = np.random.RandomState(42)
    raw = rng.normal(10.0, 2.0, size=(n_channels, n_samples)).astype(np.float32)

    car = apply_common_average_reference(raw)
    assert car.shape == (n_channels, n_samples)
    mean_across_channels = np.mean(car, axis=0)
    np.testing.assert_allclose(mean_across_channels, 0.0, atol=1e-5)


def test_ica_band_isolation():
    """Verify ICA mu and beta bandpass isolation preserves dimensions and data types."""
    n_channels = 16
    n_samples = 512
    rng = np.random.RandomState(42)
    raw = rng.normal(0, 5.0, size=(n_channels, n_samples)).astype(np.float32)

    isolated = apply_ica_band_isolation(raw, fs=128.0, l_freq=8.0, h_freq=30.0, n_components=8)
    assert isolated.shape == (n_channels, n_samples)
    assert not np.isnan(isolated).any()


def test_electrode_pair_serial_concatenation():
    """Verify symmetric motor cortex pairs are serially concatenated into 2 * n_samples vectors."""
    n_samples = 512
    channel_names = list(CLEAN_64_CHANNELS)
    dummy_data = np.zeros((len(channel_names), n_samples), dtype=np.float32)

    # Set distinct patterns on C3 and C4
    idx_c3 = channel_names.index("C3")
    idx_c4 = channel_names.index("C4")
    dummy_data[idx_c3, :] = 1.0
    dummy_data[idx_c4, :] = 2.0

    pairs = extract_electrode_pairs(dummy_data, channel_names)
    assert "C3-C4" in pairs
    c3_c4 = pairs["C3-C4"]
    assert c3_c4.shape == (1024,)  # 512 * 2
    # Left half is C3 (1.0), right half is C4 (2.0)
    np.testing.assert_allclose(c3_c4[:512], 1.0)
    np.testing.assert_allclose(c3_c4[512:], 2.0)


def test_strict_zero_data_leakage_split():
    """Verify that 5:2:3 partition strictly isolates trials and windows.
    No trial ID may ever appear in more than one partition.
    """
    # 84 trials for 2 subjects = 168 trials total
    loader = PhysioNetLoader()
    synth = loader.generate_synthetic_dataset(["S001", "S002"], trials_per_task=5, fs=160.0)
    preprocessor = EEGPreprocessor(samples_per_trial=9)

    trial_records = []
    trial_unique_ids = []
    for sub_id, trials in synth.items():
        for t_idx, (raw_data, label, ch_names) in enumerate(trials):
            samples, pair_dict = preprocessor.preprocess_trial(raw_data, ch_names)
            unique_trial_key = f"{sub_id}_trial_{t_idx}"
            trial_records.append((samples, label, sub_id, t_idx))
            trial_unique_ids.append(unique_trial_key)

    train_set, val_set, test_set = partition_dataset(trial_records, split_ratio=(5, 2, 3))
    _, _, meta_train = train_set
    _, _, meta_val = val_set
    _, _, meta_test = test_set

    # Extract unique trial keys in each split
    train_trials = set(meta_train)
    val_trials = set(meta_val)
    test_trials = set(meta_test)

    # Crucial assertion: ZERO intersection between splits
    assert len(train_trials.intersection(val_trials)) == 0, "Leakage between train and validation!"
    assert len(train_trials.intersection(test_trials)) == 0, "Leakage between train and test!"
    assert len(val_trials.intersection(test_trials)) == 0, "Leakage between val and test!"

    # Total unique trials preserved
    all_split_trials = train_trials.union(val_trials).union(test_trials)
    assert len(all_split_trials) == len(trial_records)


def test_data_augmentation():
    """Verify data augmentation increases dataset size correctly without altering labels,
    corrupting data types, or leaking to untouched validation/test sets.
    """
    rng = np.random.RandomState(42)
    n_samples = 20
    sample_len = 512
    X = rng.normal(0, 1e-5, size=(n_samples, sample_len)).astype(np.float32)
    y = rng.randint(0, 4, size=(n_samples,), dtype=np.int64)

    X_aug, y_aug, n_added = augment_training_samples(
        X, y, factor=1, noise_std_ratio=0.05, scale_range=(0.9, 1.1), max_shift=16, random_state=42
    )

    assert n_added == n_samples
    assert len(X_aug) == 2 * n_samples
    assert len(y_aug) == 2 * n_samples
    assert X_aug.shape[1] == sample_len
    assert X_aug.dtype == np.float32
    assert not np.isnan(X_aug).any()
    # Check class distributions are exactly doubled
    for c in range(4):
        assert np.sum(y_aug == c) == 2 * np.sum(y == c)
