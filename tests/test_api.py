"""Unit tests for FastAPI endpoints: upload, predict, metrics, and subjects.
"""

import io
import json
import numpy as np
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.inference import model_service, DEFAULT_ARTIFACTS_DIR
from app.models.minirocket_pipeline import MiniRocketPipeline
from app.services.metrics import MetricsCalculator


client = TestClient(app)


def test_root_health():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "NeuroMove EEG Classification Backend"
    assert data["status"] == "online"
    assert data["version"] == "2.0.0"


def test_upload_numpy_trial():
    # 64 channels x 640 timepoints (4 seconds at 160 Hz)
    dummy_eeg = np.random.randn(64, 640).astype(np.float32)
    bio = io.BytesIO()
    np.save(bio, dummy_eeg)
    bio.seek(0)

    response = client.post(
        "/api/upload",
        files={"file": ("trial_test.npy", bio, "application/octet-stream")},
    )
    assert response.status_code == 201
    data = response.json()
    assert "trial_id" in data
    assert data["num_channels"] == 64
    assert data["sampling_rate"] == 128.0


def test_predict_untrained_model():
    # Create dummy trial
    dummy_eeg = np.random.randn(64, 640).astype(np.float32)
    bio = io.BytesIO()
    np.save(bio, dummy_eeg)
    bio.seek(0)

    upload_res = client.post(
        "/api/upload",
        files={"file": ("trial_test.npy", bio, "application/octet-stream")},
    )
    trial_id = upload_res.json()["trial_id"]

    # When model is not present, predict returns 400
    # Temporarily ensure model is not available
    if not model_service.is_model_available("minirocket"):
        res = client.post(f"/api/predict/{trial_id}?model=minirocket")
        assert res.status_code == 400
        assert "not trained yet" in res.json()["detail"].lower()


def test_metrics_untrained():
    # When metric file does not exist, returns 404
    non_existent = "nonexistent_model"
    res = client.get(f"/api/metrics/{non_existent}")
    assert res.status_code == 400

    res_mr = client.get("/api/metrics/minirocket")
    # If no metrics file on disk, expect 404
    if not (DEFAULT_ARTIFACTS_DIR / "metrics_minirocket.json").exists():
        assert res_mr.status_code == 404
        assert "not found" in res_mr.json()["detail"].lower()


def test_end_to_end_prediction_with_dummy_model():
    mr_path = DEFAULT_ARTIFACTS_DIR / "minirocket.joblib"
    metrics_path = DEFAULT_ARTIFACTS_DIR / "metrics_minirocket.json"
    if not mr_path.exists() or not metrics_path.exists():
        # 1. Fit tiny MiniRocket if not already present
        X_dummy = np.random.randn(16, 1024).astype(np.float32)
        y_dummy = np.array([i % 4 for i in range(16)], dtype=np.int64)

        mr = MiniRocketPipeline(num_kernels=50, max_dilations=16)
        mr.fit(X_dummy, y_dummy)

        # Save to artifacts
        DEFAULT_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        mr.save(mr_path)

        # Save dummy metrics
        metrics = MetricsCalculator.evaluate_model(
            model_name="minirocket",
            model=mr,
            X_test=X_dummy,
            y_test=y_dummy,
            meta_test=[f"S001_trial_{i}" for i in range(16)],
        )
        MetricsCalculator.save_metrics(metrics, DEFAULT_ARTIFACTS_DIR, "minirocket")

    # 2. Upload trial
    dummy_eeg = np.random.randn(64, 640).astype(np.float32)
    bio = io.BytesIO()
    np.save(bio, dummy_eeg)
    bio.seek(0)

    upload_res = client.post(
        "/api/upload",
        files={"file": ("trial_test.npy", bio, "application/octet-stream")},
    )
    trial_id = upload_res.json()["trial_id"]

    # 3. Predict with minirocket
    pred_res = client.post(f"/api/predict/{trial_id}?model=minirocket")
    assert pred_res.status_code == 200
    preds = pred_res.json()
    assert len(preds) == 1
    assert preds[0]["model"] == "minirocket"
    assert preds[0]["predicted_class"] in [0, 1, 2, 3]
    assert "class_probabilities" in preds[0]
    assert preds[0]["latency_ms"] > 0

    # 4. Fetch metrics
    metrics_res = client.get("/api/metrics/minirocket")
    assert metrics_res.status_code == 200
    m_data = metrics_res.json()
    assert m_data["model_name"] == "minirocket"
    assert "global_accuracy" in m_data
    assert "learned_signal" in m_data
    assert "sanity_check" in m_data
    assert "verdict" in m_data["sanity_check"]

    # 5. Fetch subjects leaderboard
    subj_res = client.get("/api/subjects")
    assert subj_res.status_code == 200
    s_data = subj_res.json()
    assert len(s_data["subjects"]) > 0
    assert s_data["subjects"][0]["subject_id"] == "S001"


def test_sample_trial_and_signals():
    # 1. Test sample trial creation
    res = client.post("/api/sample-trial")
    assert res.status_code == 201
    data = res.json()
    assert "trial_id" in data
    assert data["num_channels"] > 0
    trial_id = data["trial_id"]

    # 2. Test signals endpoint
    sig_res = client.get(f"/api/trial/{trial_id}/signals")
    assert sig_res.status_code == 200
    s_data = sig_res.json()
    assert s_data["trial_id"] == trial_id
    assert "raw_preview" in s_data
    assert len(s_data["raw_preview"]) > 0
    assert "filtered_pairs" in s_data
    assert len(s_data["pairs"]) > 0

