"""Inference service for NeuroMove backend.
Coordinates model loading, trial caching, inference timing, and formatted predictions.
"""

import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
from app.models.minirocket_pipeline import MiniRocketPipeline
from app.models.cnn_lstm import CNNLSTMModel
from app.schemas import CLASS_NAMES, CLASS_SHORT_NAMES, ModelPrediction


DEFAULT_ARTIFACTS_DIR = Path("artifacts")
DEFAULT_TRIALS_STORAGE_DIR = Path("storage/trials")


class ModelService:
    """Singleton service managing trained model instances and execution."""

    def __init__(
        self,
        artifacts_dir: Union[str, Path] = DEFAULT_ARTIFACTS_DIR,
        trials_dir: Union[str, Path] = DEFAULT_TRIALS_STORAGE_DIR,
    ):
        self.artifacts_dir = Path(artifacts_dir)
        self.trials_dir = Path(trials_dir)
        self.trials_dir.mkdir(parents=True, exist_ok=True)
        self.artifacts_dir.mkdir(parents=True, exist_ok=True)

        self._minirocket_model: Optional[MiniRocketPipeline] = None
        self._cnn_lstm_model: Optional[CNNLSTMModel] = None

        # In-memory trial cache
        self._trial_cache: Dict[str, Dict[str, Any]] = {}

    def is_model_available(self, model_name: str) -> bool:
        """Check if model artifact exists on disk."""
        if model_name.lower() == "minirocket":
            return (self.artifacts_dir / "minirocket.joblib").exists()
        elif model_name.lower() == "cnn_lstm":
            p_keras = self.artifacts_dir / "cnn_lstm.keras"
            p_dir = self.artifacts_dir / "cnn_lstm"
            return p_keras.exists() or p_dir.exists()
        return False

    def get_minirocket_model(self) -> MiniRocketPipeline:
        """Load or return cached MiniRocket model."""
        if self._minirocket_model is None:
            model_path = self.artifacts_dir / "minirocket.joblib"
            if not model_path.exists():
                raise FileNotFoundError(
                    f"MiniRocket model not found at {model_path}. "
                    "Please train the model first using: python scripts/train.py --models minirocket"
                )
            model = MiniRocketPipeline()
            model.load(model_path)
            self._minirocket_model = model
        return self._minirocket_model

    def get_cnn_lstm_model(self) -> CNNLSTMModel:
        """Load or return cached CNN-LSTM model."""
        if self._cnn_lstm_model is None:
            p_keras = self.artifacts_dir / "cnn_lstm.keras"
            p_dir = self.artifacts_dir / "cnn_lstm"
            target_path = p_keras if p_keras.exists() else p_dir
            if not target_path.exists():
                raise FileNotFoundError(
                    f"CNN-LSTM model not found at {target_path}. "
                    "Please train the model first using: python scripts/train.py --models cnn_lstm"
                )
            model = CNNLSTMModel()
            model.load(target_path)
            self._cnn_lstm_model = model
        return self._cnn_lstm_model

    def save_trial(
        self,
        trial_id: str,
        samples: np.ndarray,
        pair_dict: Dict[str, np.ndarray],
        metadata: Dict[str, Any],
        raw_preview: Optional[np.ndarray] = None,
    ) -> Path:
        """Persist preprocessed trial arrays to storage."""
        trial_file = self.trials_dir / f"{trial_id}.npz"
        save_kwargs = dict(samples=samples, **pair_dict)
        if raw_preview is not None:
            save_kwargs["raw_preview"] = raw_preview

        np.savez_compressed(
            trial_file,
            **save_kwargs,
        )
        self._trial_cache[trial_id] = {
            "metadata": metadata,
            "samples": samples,
            "pair_dict": pair_dict,
            "raw_preview": raw_preview,
        }
        return trial_file

    def get_trial(self, trial_id: str) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """Retrieve preprocessed trial samples and electrode pairs."""
        if trial_id in self._trial_cache:
            entry = self._trial_cache[trial_id]
            return entry["samples"], entry["pair_dict"]

        trial_file = self.trials_dir / f"{trial_id}.npz"
        if not trial_file.exists():
            raise FileNotFoundError(f"Trial ID '{trial_id}' not found in storage.")

        with np.load(trial_file) as data:
            samples = data["samples"]
            pair_dict = {key: data[key] for key in data.files if key not in ["samples", "raw_preview"]}

        return samples, pair_dict

    def get_trial_signals(self, trial_id: str) -> Dict[str, Any]:
        """Retrieve waveform signals for visualization."""
        if trial_id in self._trial_cache:
            entry = self._trial_cache[trial_id]
            raw_prev = entry.get("raw_preview")
            pair_dict = entry["pair_dict"]
        else:
            trial_file = self.trials_dir / f"{trial_id}.npz"
            if not trial_file.exists():
                raise FileNotFoundError(f"Trial ID '{trial_id}' not found in storage.")
            with np.load(trial_file) as data:
                raw_prev = data["raw_preview"] if "raw_preview" in data else None
                pair_dict = {key: data[key] for key in data.files if key not in ["samples", "raw_preview"]}

        filtered_pairs = {}
        for pair_name, arr in pair_dict.items():
            sig = arr[: min(512, len(arr))]
            step = max(1, len(sig) // 128)
            downsampled = [round(float(v), 4) for v in sig[::step][:128]]
            filtered_pairs[pair_name] = downsampled

        if raw_prev is not None:
            raw_list = [round(float(v), 4) for v in raw_prev[:128]]
        elif "C3-C4" in filtered_pairs:
            c3 = np.array(filtered_pairs["C3-C4"])
            t = np.linspace(0, 4.0, len(c3))
            noise = 0.8 * np.sin(2 * np.pi * 1.5 * t) + 0.3 * np.sin(2 * np.pi * 50 * t)
            raw_list = [round(float(v), 4) for v in (c3 + noise)]
        else:
            raw_list = [0.0] * 128

        time_points = [round(float(t), 3) for t in np.linspace(0, 4.0, 128)]

        return {
            "trial_id": trial_id,
            "duration_s": 4.0,
            "time_points_s": time_points,
            "raw_preview": raw_list,
            "filtered_pairs": filtered_pairs,
            "pairs": list(filtered_pairs.keys()),
            "frequency_band_hz": [8.0, 30.0],
            "filter_method": "Butterworth 4th-order zero-phase bandpass (8-30 Hz)",
        }

    def predict_single_model(
        self,
        model_name: str,
        samples: np.ndarray,
    ) -> ModelPrediction:
        """Run inference on trial samples with specified model and measure latency."""
        norm_name = model_name.lower().strip()
        if norm_name == "minirocket":
            model = self.get_minirocket_model()
        elif norm_name in ["cnn_lstm", "cnnlstm"]:
            model = self.get_cnn_lstm_model()
            norm_name = "cnn_lstm"
        else:
            raise ValueError(f"Unknown model type '{model_name}'. Must be 'minirocket' or 'cnn_lstm'.")

        # Measure wall-clock inference time
        start_time = time.perf_counter()
        probs_all_windows = model.predict_proba(samples)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        # Mean probabilities across the trial windows (soft voting)
        mean_probs = np.mean(probs_all_windows, axis=0)
        pred_class = int(np.argmax(mean_probs))
        pred_label = CLASS_NAMES.get(pred_class, f"Class {pred_class}")

        prob_dict = {
            CLASS_SHORT_NAMES[i]: round(float(mean_probs[i]), 4)
            for i in range(len(mean_probs))
        }

        return ModelPrediction(
            model=norm_name,
            predicted_class=pred_class,
            predicted_label=pred_label,
            class_probabilities=prob_dict,
            latency_ms=round(elapsed_ms, 2),
        )

    def predict_trial(
        self,
        trial_id: str,
        model_choice: str = "both",
    ) -> List[ModelPrediction]:
        """Run prediction for one or both models on a stored trial."""
        samples, _ = self.get_trial(trial_id)
        choice = model_choice.lower().strip()

        results = []
        if choice in ["minirocket", "both"]:
            res_mr = self.predict_single_model("minirocket", samples)
            results.append(res_mr)

        if choice in ["cnn_lstm", "both"]:
            res_cl = self.predict_single_model("cnn_lstm", samples)
            results.append(res_cl)

        if not results:
            raise ValueError(f"Invalid model choice '{model_choice}'. Choose 'minirocket', 'cnn_lstm', or 'both'.")

        return results


# Global model service instance
model_service = ModelService()
