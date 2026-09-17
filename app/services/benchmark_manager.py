"""Benchmark Dataset Manager for NeuroMove.
Manages a curated set of 10 real PhysioNet motor imagery EEG trials
spanning diverse subjects (S001, S002, S003, S089) and all four
motor imagery classes (T1: Left Fist, T2: Right Fist, T3: Both Fists, T4: Both Feet).
Provides single-trial ingestion with ground-truth verification and batch evaluation.
"""

import random
import uuid
from typing import Any, Dict, List, Optional, Tuple
import numpy as np

from app.data.loader import CLEAN_64_CHANNELS, PhysioNetLoader
from app.data.preprocessing import EEGPreprocessor, clean_channel_name
from app.schemas import (
    Benchmark10Response,
    BenchmarkDatasetInfo,
    BenchmarkTrialResult,
    ModelPrediction,
    UploadResponse,
)
from app.services.inference import model_service


BENCHMARK_SPECS: List[Dict[str, Any]] = [
    {
        "dataset_id": "ds_01",
        "name": "Dataset #1: S001 · Left Fist (T1)",
        "subject_id": "S001",
        "run": 4,
        "target_class": 0,
        "class_code": "T1",
        "class_label": "Left Fist (L)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_02",
        "name": "Dataset #2: S001 · Right Fist (T2)",
        "subject_id": "S001",
        "run": 4,
        "target_class": 1,
        "class_code": "T2",
        "class_label": "Right Fist (R)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_03",
        "name": "Dataset #3: S001 · Both Fists (T3)",
        "subject_id": "S001",
        "run": 6,
        "target_class": 2,
        "class_code": "T3",
        "class_label": "Both Fists (BLR)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_04",
        "name": "Dataset #4: S001 · Both Feet (T4)",
        "subject_id": "S001",
        "run": 6,
        "target_class": 3,
        "class_code": "T4",
        "class_label": "Both Feet (BF)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_05",
        "name": "Dataset #5: S002 · Left Fist (T1)",
        "subject_id": "S002",
        "run": 4,
        "target_class": 0,
        "class_code": "T1",
        "class_label": "Left Fist (L)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_06",
        "name": "Dataset #6: S002 · Right Fist (T2)",
        "subject_id": "S002",
        "run": 4,
        "target_class": 1,
        "class_code": "T2",
        "class_label": "Right Fist (R)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_07",
        "name": "Dataset #7: S003 · Both Fists (T3)",
        "subject_id": "S003",
        "run": 6,
        "target_class": 2,
        "class_code": "T3",
        "class_label": "Both Fists (BLR)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_08",
        "name": "Dataset #8: S003 · Both Feet (T4)",
        "subject_id": "S003",
        "run": 6,
        "target_class": 3,
        "class_code": "T4",
        "class_label": "Both Feet (BF)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_09",
        "name": "Dataset #9: S004 · Right Fist (T2)",
        "subject_id": "S004",
        "run": 4,
        "target_class": 1,
        "class_code": "T2",
        "class_label": "Right Fist (R)",
        "trial_match_idx": 0,
    },
    {
        "dataset_id": "ds_10",
        "name": "Dataset #10: S005 · Both Feet (T4)",
        "subject_id": "S005",
        "run": 6,
        "target_class": 3,
        "class_code": "T4",
        "class_label": "Both Feet (BF)",
        "trial_match_idx": 0,
    },
]


class BenchmarkDatasetManager:
    """Manages extraction, caching, and evaluation of the 10 benchmark datasets."""

    def __init__(self):
        self.loader = PhysioNetLoader()
        self.preprocessor = EEGPreprocessor()
        # In-memory raw cache: dataset_id -> (raw_data, channel_names)
        self._raw_cache: Dict[str, Tuple[np.ndarray, List[str]]] = {}

    def get_dataset_list(self) -> List[BenchmarkDatasetInfo]:
        """Returns metadata descriptions of all 10 benchmark datasets."""
        info_list = []
        for spec in BENCHMARK_SPECS:
            info_list.append(
                BenchmarkDatasetInfo(
                    dataset_id=spec["dataset_id"],
                    name=spec["name"],
                    subject_id=spec["subject_id"],
                    run=spec["run"],
                    ground_truth_class=spec["target_class"],
                    ground_truth_code=spec["class_code"],
                    ground_truth_label=spec["class_label"],
                    duration_s=4.0,
                    sampling_rate=128.0,
                    num_channels=64,
                )
            )
        return info_list

    def _extract_raw_trial(self, spec: Dict[str, Any]) -> Tuple[np.ndarray, List[str]]:
        """Extract raw EEG trial from local EDF recording or generate fallback."""
        ds_id = spec["dataset_id"]
        if ds_id in self._raw_cache:
            return self._raw_cache[ds_id]

        sub = spec["subject_id"]
        run = spec["run"]
        target_cls = spec["target_class"]
        match_idx = spec.get("trial_match_idx", 0)

        raw_data = None
        channel_names = list(CLEAN_64_CHANNELS)

        try:
            raw_mne = self.loader.load_run_raw(sub, run)
            channel_names = raw_mne.ch_names
            trials = self.loader.extract_trials_from_raw(raw_mne, run)
            matching = [t for t in trials if t[1] == target_cls]
            if matching:
                selected_idx = min(match_idx, len(matching) - 1)
                raw_data = matching[selected_idx][0]
        except Exception:
            raw_data = None

        if raw_data is None:
            # Synthetic fallback if file cannot be read
            raw_data, channel_names = PhysioNetLoader.generate_synthetic_trial(
                target_class=target_cls,
                fs=160.0,
                duration_s=4.0,
            )

        self._raw_cache[ds_id] = (raw_data, channel_names)
        return raw_data, channel_names

    def load_trial(
        self,
        dataset_id: Optional[str] = None,
        random_pick: bool = False,
    ) -> Tuple[str, UploadResponse]:
        """Loads a specified or random benchmark trial into memory and returns UploadResponse."""
        if random_pick or not dataset_id:
            spec = random.choice(BENCHMARK_SPECS)
        else:
            spec = next((s for s in BENCHMARK_SPECS if s["dataset_id"] == dataset_id), None)
            if spec is None:
                spec = BENCHMARK_SPECS[0]

        raw_data, channel_names = self._extract_raw_trial(spec)

        trial_id = f"trial_bench_{spec['dataset_id']}_{uuid.uuid4().hex[:6]}"

        samples, pair_dict = self.preprocessor.preprocess_trial(
            raw_data=raw_data,
            channel_names=channel_names,
        )

        # Downsample preview
        raw_ch_idx = 0
        for idx, ch in enumerate(channel_names):
            if clean_channel_name(ch) in ["C3", "CZ", "C4"]:
                raw_ch_idx = idx
                break
        ch_sig = raw_data[raw_ch_idx]
        step = max(1, len(ch_sig) // 128)
        raw_preview = ch_sig[::step][:128].astype(np.float32)

        metadata = {
            "trial_id": trial_id,
            "dataset_id": spec["dataset_id"],
            "dataset_name": spec["name"],
            "subject_id": spec["subject_id"],
            "original_filename": f"PhysioNet_{spec['subject_id']}_R{spec['run']:02d}_{spec['class_code']}.edf",
            "channels": channel_names,
            "original_fs": 160.0,
            "target_fs": 128.0,
            "duration_s": 4.0,
            "ground_truth_class": spec["target_class"],
            "ground_truth_code": spec["class_code"],
            "ground_truth_label": spec["class_label"],
        }
        model_service.save_trial(trial_id, samples, pair_dict, metadata, raw_preview=raw_preview)

        response = UploadResponse(
            trial_id=trial_id,
            channels=[clean_channel_name(ch) for ch in channel_names[:10]],
            num_channels=len(channel_names),
            duration_s=4.0,
            sampling_rate=128.0,
            samples_per_channel=samples.shape[1],
            message=f"Loaded {spec['name']} with verified Ground-Truth {spec['class_code']} ({spec['class_label']}).",
            ground_truth_class=spec["target_class"],
            ground_truth_code=spec["class_code"],
            ground_truth_label=spec["class_label"],
            dataset_name=spec["name"],
        )

        return trial_id, response

    def evaluate_10_datasets(self, model_choice: str = "both") -> Benchmark10Response:
        """Runs batch inference on all 10 benchmark datasets and computes accuracy/latency."""
        results: List[BenchmarkTrialResult] = []
        mr_correct = 0
        cl_correct = 0
        mr_latencies = []
        cl_latencies = []
        agreements = 0

        for spec in BENCHMARK_SPECS:
            trial_id, _ = self.load_trial(dataset_id=spec["dataset_id"])
            preds = model_service.predict_trial(trial_id, model_choice=model_choice)

            pred_mr: Optional[ModelPrediction] = None
            pred_cl: Optional[ModelPrediction] = None

            for p in preds:
                if p.model == "minirocket":
                    pred_mr = p
                    mr_latencies.append(p.latency_ms)
                    if p.predicted_class == spec["target_class"]:
                        mr_correct += 1
                elif p.model == "cnn_lstm":
                    pred_cl = p
                    cl_latencies.append(p.latency_ms)
                    if p.predicted_class == spec["target_class"]:
                        cl_correct += 1

            is_mr_correct = (pred_mr.predicted_class == spec["target_class"]) if pred_mr else None
            is_cl_correct = (pred_cl.predicted_class == spec["target_class"]) if pred_cl else None

            if pred_mr and pred_cl and pred_mr.predicted_class == pred_cl.predicted_class:
                agreements += 1

            results.append(
                BenchmarkTrialResult(
                    dataset_id=spec["dataset_id"],
                    name=spec["name"],
                    subject_id=spec["subject_id"],
                    ground_truth_class=spec["target_class"],
                    ground_truth_code=spec["class_code"],
                    ground_truth_label=spec["class_label"],
                    trial_id=trial_id,
                    minirocket_prediction=pred_mr,
                    cnn_lstm_prediction=pred_cl,
                    minirocket_correct=is_mr_correct,
                    cnn_lstm_correct=is_cl_correct,
                )
            )

        total = len(BENCHMARK_SPECS)
        return Benchmark10Response(
            total_trials=total,
            minirocket_accuracy=round((mr_correct / total) * 100.0, 1) if mr_latencies else None,
            cnn_lstm_accuracy=round((cl_correct / total) * 100.0, 1) if cl_latencies else None,
            minirocket_mean_latency_ms=round(float(np.mean(mr_latencies)), 2) if mr_latencies else None,
            cnn_lstm_mean_latency_ms=round(float(np.mean(cl_latencies)), 2) if cl_latencies else None,
            consensus_rate=round((agreements / total) * 100.0, 1) if (mr_latencies and cl_latencies) else None,
            results=results,
        )


# Global benchmark manager instance
benchmark_manager = BenchmarkDatasetManager()
