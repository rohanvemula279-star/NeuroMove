"""Unit tests for Subject-Dependent (Within-Subject) 10-Fold Cross-Validation.
Paper Reference: Hwaidi & Ghanem (NeuroImage 328, 2026), Section 3.1 & Figure 6.
"""

import numpy as np
import pytest
from fastapi.testclient import TestClient
from sklearn.model_selection import StratifiedKFold
from app.main import app
from app.schemas import MetricSummary, LeaderboardResponse
from app.services.metrics import MetricsCalculator
from app.services.inference import DEFAULT_ARTIFACTS_DIR
from app.models.minirocket_pipeline import MiniRocketPipeline

client = TestClient(app)


def test_within_subject_cv_splitting_zero_leakage():
    """Verify that 10-fold CV at the trial level strictly isolates all 9 sub-windows
    per trial with zero trial or window leakage across folds.
    """
    n_classes = 4
    trials_per_class = 21
    samples_per_trial = 9
    total_trials = n_classes * trials_per_class  # 84 trials

    trial_records = []
    trial_labels = []
    for c in range(n_classes):
        for t in range(trials_per_class):
            t_id = f"trial_{c}_{t}"
            # 9 sub-windows of length 64
            sub_windows = np.random.randn(samples_per_trial, 64).astype(np.float32)
            trial_records.append((sub_windows, c, "S001", t_id))
            trial_labels.append(c)

    trial_labels = np.array(trial_labels)
    skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

    tested_trial_ids = set()

    for fold_idx, (train_idx, test_idx) in enumerate(skf.split(trial_records, trial_labels)):
        # Check strict trial disjointness
        train_set = set(train_idx)
        test_set = set(test_idx)
        assert len(train_set.intersection(test_set)) == 0, f"Fold {fold_idx} has trial leakage!"

        # Check fold sizes: 84 / 10 = roughly 8 or 9 test trials
        assert len(test_idx) in [8, 9]
        assert len(train_idx) in [75, 76]

        for idx in test_idx:
            _, _, _, t_id = trial_records[idx]
            assert t_id not in tested_trial_ids, f"Trial {t_id} tested in multiple folds!"
            tested_trial_ids.add(t_id)

    # Every trial must be evaluated exactly once across 10 folds
    assert len(tested_trial_ids) == total_trials


def test_evaluate_subject_dependent_cv_metrics():
    """Verify that MetricsCalculator.evaluate_subject_dependent_cv properly aggregates
    fold metrics, subject metrics, per-class accuracies, and sanity check.
    """
    # Create mock out-of-fold predictions for two subjects
    subject_results = {}
    for sub in ["S001", "S002"]:
        n_samples = 84 * 9  # 756 samples
        y_true = np.array([i % 4 for i in range(n_samples)], dtype=np.int64)
        # Create realistic predictions with ~60% accuracy
        y_pred = y_true.copy()
        rng = np.random.RandomState(42)
        flip_mask = rng.rand(n_samples) > 0.6
        y_pred[flip_mask] = rng.randint(0, 4, size=int(np.sum(flip_mask)))

        # One-hot-like probabilities
        y_probs = np.zeros((n_samples, 4), dtype=np.float32)
        for i, p in enumerate(y_pred):
            y_probs[i, p] = 0.7
            for other in range(4):
                if other != p:
                    y_probs[i, other] = 0.1

        fold_accs = [0.58, 0.62, 0.60, 0.64, 0.59, 0.61, 0.63, 0.57, 0.60, 0.62]
        subject_results[sub] = {
            "fold_accuracies": fold_accs,
            "y_true": y_true,
            "y_pred": y_pred,
            "y_probs": y_probs,
            "trials_used": 84,
            "train_time_s": 5.0,
        }

    # Dummy representative model
    rep_model = MiniRocketPipeline(num_kernels=10, max_dilations=8)
    dummy_X = np.random.randn(8, 64).astype(np.float32)
    dummy_y = np.array([0, 1, 2, 3, 0, 1, 2, 3], dtype=np.int64)
    rep_model.fit(dummy_X, dummy_y)

    metrics = MetricsCalculator.evaluate_subject_dependent_cv(
        model_name="minirocket",
        subject_results=subject_results,
        representative_model=rep_model,
        representative_sample=dummy_X[0],
        total_train_time_s=10.0,
    )

    assert metrics["model_name"] == "minirocket"
    assert metrics["mode"] == "subject_dependent"
    assert "Within-Subject" in metrics["evaluation_protocol"]
    assert "S001" in metrics["per_subject_accuracy"]
    assert "S002" in metrics["per_subject_accuracy"]
    assert "S001" in metrics["per_subject_per_class"]
    assert "T1" in metrics["per_subject_per_class"]["S001"]
    assert len(metrics["confusion_matrix"]) == 4
    assert len(metrics["confusion_matrix"][0]) == 4
    assert metrics["global_accuracy"] > 0.5
    assert metrics["learned_signal"] is True
    assert "S001" in metrics["subject_fold_details"]
    assert len(metrics["subject_fold_details"]["S001"]["fold_accuracies"]) == 10


def test_save_and_load_subject_dependent_metrics(tmp_path):
    """Verify that save_metrics and load_metrics distinguish between pooled and subject-dependent files."""
    mock_metrics = {
        "model_name": "minirocket",
        "mode": "subject_dependent",
        "global_accuracy": 0.55,
        "macro_precision": 0.55,
        "macro_recall": 0.55,
        "macro_f1": 0.55,
        "per_class_metrics": {},
        "confusion_matrix": [[1.0, 0.0, 0.0, 0.0]],
        "roc_auc": {"macro_auc": 0.8},
        "roc_curves": {},
        "per_subject_accuracy": {"S001": 0.55},
        "per_subject_per_class": {"S001": {"T1": 0.55}},
        "inference_latency": {"ms_per_sample": 1.0, "ms_per_trial": 9.0},
        "trainable_parameters": 100,
        "training_time_s": 12.5,
        "learned_signal": True,
        "sanity_check": {"verdict": "LEARNED_SIGNAL"},
        "subject_fold_details": {},
    }

    # Save as subject_dependent
    saved_path = MetricsCalculator.save_metrics(
        mock_metrics, tmp_path, "minirocket", mode="subject_dependent"
    )
    assert saved_path.name == "metrics_minirocket_subject_dependent.json"

    # Load as subject_dependent
    loaded = MetricsCalculator.load_metrics(tmp_path, "minirocket", mode="subject_dependent")
    assert loaded["mode"] == "subject_dependent"
    assert loaded["global_accuracy"] == 0.55

    # Attempting to load as pooled should raise FileNotFoundError
    with pytest.raises(FileNotFoundError):
        MetricsCalculator.load_metrics(tmp_path, "minirocket", mode="pooled")


def test_api_metrics_with_subject_dependent_mode(tmp_path, monkeypatch):
    """Verify GET /api/metrics/{model}?mode=subject_dependent and ?mode=pooled endpoints."""
    # Temporarily point DEFAULT_ARTIFACTS_DIR to test tmp_path
    from app.routers import metrics as metrics_router
    from app.routers import subjects as subjects_router

    monkeypatch.setattr(metrics_router, "DEFAULT_ARTIFACTS_DIR", tmp_path)
    monkeypatch.setattr(subjects_router, "DEFAULT_ARTIFACTS_DIR", tmp_path)

    # 1. 404 when not present
    res = client.get("/api/metrics/minirocket?mode=subject_dependent")
    assert res.status_code == 404
    assert "subject_dependent" in res.json()["detail"].lower()

    # 2. Save mock metrics for both modes
    base_metric = {
        "model_name": "minirocket",
        "global_accuracy": 0.42,
        "macro_precision": 0.42,
        "macro_recall": 0.42,
        "macro_f1": 0.42,
        "per_class_metrics": {
            "T1": {"label": "T1", "precision": 0.4, "recall": 0.4, "f1_score": 0.4, "support": 21},
            "T2": {"label": "T2", "precision": 0.4, "recall": 0.4, "f1_score": 0.4, "support": 21},
            "T3": {"label": "T3", "precision": 0.4, "recall": 0.4, "f1_score": 0.4, "support": 21},
            "T4": {"label": "T4", "precision": 0.4, "recall": 0.4, "f1_score": 0.4, "support": 21},
        },
        "confusion_matrix": [[0.25] * 4] * 4,
        "roc_auc": {"macro_auc": 0.7},
        "roc_curves": {},
        "per_subject_accuracy": {"S001": 0.42},
        "per_subject_per_class": {"S001": {"T1": 0.45, "T2": 0.40, "T3": 0.42, "T4": 0.41}},
        "inference_latency": {"ms_per_sample": 1.2, "ms_per_trial": 10.8},
        "trainable_parameters": 10000,
        "training_time_s": 15.0,
        "learned_signal": True,
        "sanity_check": {"verdict": "LEARNED_SIGNAL"},
    }

    pooled_metric = dict(base_metric, mode="pooled", global_accuracy=0.34)
    subj_dep_metric = dict(
        base_metric,
        mode="subject_dependent",
        global_accuracy=0.48,
        subject_fold_details={"S001": {"mean_accuracy": 0.48, "std_accuracy": 0.05, "fold_accuracies": [0.48]*10}},
    )

    MetricsCalculator.save_metrics(pooled_metric, tmp_path, "minirocket", mode="pooled")
    MetricsCalculator.save_metrics(subj_dep_metric, tmp_path, "minirocket", mode="subject_dependent")

    # Query pooled (default)
    res_pooled = client.get("/api/metrics/minirocket")
    assert res_pooled.status_code == 200
    assert res_pooled.json()["mode"] == "pooled"
    assert res_pooled.json()["global_accuracy"] == 0.34

    # Query subject_dependent
    res_sub = client.get("/api/metrics/minirocket?mode=subject_dependent")
    assert res_sub.status_code == 200
    assert res_sub.json()["mode"] == "subject_dependent"
    assert res_sub.json()["global_accuracy"] == 0.48
    assert res_sub.json()["subject_fold_details"] is not None

    # Query subjects leaderboard with mode
    res_lead_sub = client.get("/api/subjects?mode=subject_dependent")
    assert res_lead_sub.status_code == 200
    assert res_lead_sub.json()["mode"] == "subject_dependent"
    assert len(res_lead_sub.json()["subjects"]) == 1
    assert res_lead_sub.json()["subjects"][0]["subject_id"] == "S001"
    assert res_lead_sub.json()["subjects"][0]["minirocket_accuracy"] == 0.42
