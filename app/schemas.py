"""Pydantic schemas for NeuroMove API request and response models.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


CLASS_NAMES = {
    0: "T1: Left Fist (L)",
    1: "T2: Right Fist (R)",
    2: "T3: Both Fists (BLR)",
    3: "T4: Both Feet (BF)",
}

CLASS_SHORT_NAMES = {
    0: "T1",
    1: "T2",
    2: "T3",
    3: "T4",
}


class UploadResponse(BaseModel):
    trial_id: str = Field(..., description="Unique identifier for the uploaded trial")
    channels: List[str] = Field(..., description="List of electrode channel names extracted")
    num_channels: int = Field(..., description="Number of channels")
    duration_s: float = Field(..., description="Trial duration in seconds")
    sampling_rate: float = Field(..., description="Downsampled sampling rate in Hz (128 Hz)")
    samples_per_channel: int = Field(..., description="Sample points per channel")
    message: str = Field("Trial uploaded and preprocessed successfully", description="Status message")
    ground_truth_class: Optional[int] = Field(None, description="Ground-truth integer class if known")
    ground_truth_code: Optional[str] = Field(None, description="Ground-truth class code (T1..T4) if known")
    ground_truth_label: Optional[str] = Field(None, description="Ground-truth human-readable label if known")
    dataset_name: Optional[str] = Field(None, description="Benchmark dataset name if applicable")


class BenchmarkDatasetInfo(BaseModel):
    dataset_id: str = Field(..., description="Unique dataset identifier")
    name: str = Field(..., description="Display title for the benchmark dataset")
    subject_id: str = Field(..., description="PhysioNet subject identifier")
    run: int = Field(..., description="PhysioNet run number")
    ground_truth_class: int = Field(..., description="Verified motor imagery class index (0-3)")
    ground_truth_code: str = Field(..., description="Class code (T1, T2, T3, T4)")
    ground_truth_label: str = Field(..., description="Human-readable class name")
    duration_s: float = Field(4.0, description="Trial duration in seconds")
    sampling_rate: float = Field(128.0, description="Sampling frequency in Hz")
    num_channels: int = Field(64, description="Number of EEG channels")


class ModelPrediction(BaseModel):
    model: str = Field(..., description="Name of the model ('minirocket' or 'cnn_lstm')")
    predicted_class: int = Field(..., description="Integer class index (0, 1, 2, 3)")
    predicted_label: str = Field(..., description="Human-readable class name")
    class_probabilities: Dict[str, float] = Field(
        ..., description="Normalized posterior probabilities or decision scores per class"
    )
    latency_ms: float = Field(..., description="Inference latency in milliseconds")


class StreamFrame(BaseModel):
    trial_id: str = Field(..., description="Trial ID being streamed")
    frame_index: int = Field(..., description="Incremental frame index")
    timestamp_ms: float = Field(..., description="Elapsed playback time in milliseconds")
    window_start_s: float = Field(..., description="Window start time in seconds")
    window_end_s: float = Field(..., description="Window end time in seconds")
    predicted_label: str = Field(..., description="Predicted class for the current window")
    class_probabilities: Dict[str, float] = Field(..., description="Probabilities for the sub-window")


class ClassMetric(BaseModel):
    precision: float
    recall: float
    f1_score: float
    support: int


class MetricSummary(BaseModel):
    model_config = {"extra": "ignore"}

    model_name: str
    global_accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    per_class_metrics: Dict[str, ClassMetric]
    confusion_matrix: List[List[float]]
    roc_auc: Dict[str, float]
    roc_curves: Dict[str, Dict[str, List[float]]]
    per_subject_accuracy: Dict[str, float]
    per_subject_per_class: Dict[str, Dict[str, float]]
    inference_latency: Dict[str, float]
    trainable_parameters: int
    training_time_s: float
    learned_signal: bool = Field(False, description="Sanity check flag: did model learn beyond chance")
    sanity_check: Dict[str, Any] = Field(default_factory=dict, description="Sanity check diagnostic details")
    mode: str = Field("pooled", description="Evaluation mode: 'pooled' or 'subject_dependent'")
    evaluation_protocol: Optional[str] = Field(None, description="Validation protocol description")
    subject_fold_details: Optional[Dict[str, Any]] = Field(
        None, description="Detailed 10-fold CV breakdown per subject for subject_dependent mode"
    )


class SubjectLeaderboardItem(BaseModel):
    subject_id: str
    minirocket_accuracy: Optional[float] = None
    cnn_lstm_accuracy: Optional[float] = None
    best_model: Optional[str] = None
    per_class_accuracies: Optional[Dict[str, float]] = None


class LeaderboardResponse(BaseModel):
    mode: str = Field("pooled", description="Leaderboard mode: 'pooled' or 'subject_dependent'")
    subjects: List[SubjectLeaderboardItem]
    overall_mean_minirocket: Optional[float] = None
    overall_mean_cnn_lstm: Optional[float] = None


class BenchmarkTrialResult(BaseModel):
    dataset_id: str
    name: str
    subject_id: str
    ground_truth_class: int
    ground_truth_code: str
    ground_truth_label: str
    trial_id: str
    minirocket_prediction: Optional[ModelPrediction] = None
    cnn_lstm_prediction: Optional[ModelPrediction] = None
    minirocket_correct: Optional[bool] = None
    cnn_lstm_correct: Optional[bool] = None


class Benchmark10Response(BaseModel):
    total_trials: int
    minirocket_accuracy: Optional[float] = None
    cnn_lstm_accuracy: Optional[float] = None
    minirocket_mean_latency_ms: Optional[float] = None
    cnn_lstm_mean_latency_ms: Optional[float] = None
    consensus_rate: Optional[float] = None
    results: List[BenchmarkTrialResult] = Field(default_factory=list)

