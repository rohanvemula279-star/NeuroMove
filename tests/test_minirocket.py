"""Unit tests for Model 1: MiniRocket + Ridge classifier pipeline.
"""

import tempfile
from pathlib import Path
import numpy as np
import pytest
from app.models.minirocket_pipeline import MiniRocketPipeline, MiniRocketPerPairClassifier


@pytest.fixture
def dummy_data():
    """Generates synthetic feature data for 4-class MI testing."""
    rng = np.random.RandomState(42)
    n_samples = 32
    seq_len = 512
    # 4 distinct frequency/offset patterns for classes 0, 1, 2, 3
    t = np.linspace(0, 1.0, seq_len)
    X = []
    y = []
    for i in range(n_samples):
        c = i % 4
        freq = 10.0 * (c + 1)
        sig = np.sin(2 * np.pi * freq * t) + rng.normal(0, 0.2, seq_len)
        X.append(sig)
        y.append(c)

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64)


def test_minirocket_pipeline_fit_predict(dummy_data):
    X, y = dummy_data
    # Fast test with K=100 kernels
    pipeline = MiniRocketPipeline(num_kernels=100, max_dilations=28)
    pipeline.fit(X, y)

    assert pipeline.is_trained
    assert pipeline.count_parameters() > 0

    # Test predict
    preds = pipeline.predict(X)
    assert preds.shape == (len(y),)
    assert set(preds).issubset({0, 1, 2, 3})

    # Test predict_proba
    probs = pipeline.predict_proba(X)
    assert probs.shape == (len(y), 4)
    np.testing.assert_allclose(probs.sum(axis=1), 1.0, atol=1e-5)

    # Test evaluation
    metrics = pipeline.evaluate(X, y)
    assert "accuracy" in metrics
    assert "macro_f1" in metrics
    assert 0.0 <= metrics["accuracy"] <= 1.0


def test_minirocket_save_load(dummy_data):
    X, y = dummy_data
    pipeline = MiniRocketPipeline(num_kernels=50, max_dilations=16)
    pipeline.fit(X, y)
    orig_preds = pipeline.predict(X)

    with tempfile.TemporaryDirectory() as tmpdir:
        save_path = Path(tmpdir) / "test_mr.joblib"
        pipeline.save(save_path)
        assert save_path.exists()

        loaded_pipeline = MiniRocketPipeline()
        loaded_pipeline.load(save_path)
        loaded_preds = loaded_pipeline.predict(X)

        np.testing.assert_array_equal(orig_preds, loaded_preds)


def test_minirocket_per_pair_classifier(dummy_data):
    X, y = dummy_data
    pair_data = {
        "C3-C4": X,
        "FC3-FC4": X + 0.1,
        "CP3-CP4": X - 0.1,
    }

    per_pair = MiniRocketPerPairClassifier(num_kernels=50, max_dilations=16)
    per_pair.fit(pair_data, y)

    pair_preds = per_pair.predict_per_pair(pair_data)
    assert "C3-C4" in pair_preds
    assert len(pair_preds["C3-C4"]) == len(y)

    pair_probs = per_pair.predict_proba_per_pair(pair_data)
    assert "C3-C4" in pair_probs
    assert pair_probs["C3-C4"].shape == (len(y), 4)

    ensemble_preds, ensemble_probs = per_pair.predict_ensemble(pair_data)
    assert ensemble_preds.shape == (len(y),)
    assert ensemble_probs.shape == (len(y), 4)
