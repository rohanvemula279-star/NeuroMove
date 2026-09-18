"""Trial upload endpoint for NeuroMove backend.
Supports EDF, CSV, and NumPy array formats with full preprocessing.
"""

import io
import tempfile
import uuid
from pathlib import Path
from typing import List, Optional
import numpy as np
import mne
from fastapi import APIRouter, File, HTTPException, UploadFile, Query, status
from app.data.preprocessing import EEGPreprocessor, clean_channel_name
from app.data.loader import CLEAN_64_CHANNELS
from app.schemas import UploadResponse, BenchmarkDatasetInfo, Benchmark10Response
from app.services.inference import model_service
from app.services.benchmark_manager import benchmark_manager


router = APIRouter(prefix="/api", tags=["Upload"])
preprocessor = EEGPreprocessor()


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and preprocess raw EEG trial (EDF, CSV, or NumPy)",
)
async def upload_trial(file: UploadFile = File(...)) -> UploadResponse:
    """Accepts an EDF, CSV, or NumPy file representing an EEG trial,
    validates sampling rate and channels, runs the 6-stage preprocessing pipeline,
    persists the trial to storage, and returns the trial ID.
    """
    filename = file.filename.lower() if file.filename else "unknown"
    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    raw_data: Optional[np.ndarray] = None
    channel_names: List[str] = []
    sampling_rate: float = 160.0
    detected_ann: Optional[str] = None
    detected_run: Optional[int] = None

    # 1. Handle EDF File
    if filename.endswith(".edf"):
        with tempfile.NamedTemporaryFile(suffix=".edf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = Path(tmp.name)

        try:
            raw = mne.io.read_raw_edf(str(tmp_path), preload=True, verbose=False)
            raw_data = raw.get_data()  # shape (n_channels, n_samples)
            channel_names = raw.ch_names
            sampling_rate = float(raw.info["sfreq"])

            # Extract run number from filename if available, e.g. S039R04.edf -> run 4
            import re
            run_match = re.search(r"[rR](\d{2})", filename)
            if run_match:
                detected_run = int(run_match.group(1))

            # If EDF contains PhysioNet task annotations (T1/T2), extract the first active 4s MI trial
            try:
                events, event_dict = mne.events_from_annotations(raw, verbose=False)
                for ev in events:
                    ann = [k for k, v in event_dict.items() if v == ev[2]][0]
                    if ann in ["T1", "T2"]:
                        detected_ann = ann
                        t_start = ev[0]
                        t_end = int(t_start + 4.0 * sampling_rate)
                        if t_end <= raw_data.shape[1]:
                            raw_data = raw_data[:, t_start:t_end]
                            break
            except Exception:
                pass
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Could not parse EDF file: {str(e)}",
            )
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

    # 2. Handle NumPy (.npy or .npz)
    elif filename.endswith(".npy") or filename.endswith(".npz"):
        try:
            bio = io.BytesIO(contents)
            if filename.endswith(".npz"):
                npz_data = np.load(bio)
                raw_data = npz_data[npz_data.files[0]]
            else:
                raw_data = np.load(bio)

            if raw_data.ndim == 1:
                # 1D single-channel or flattened
                raw_data = raw_data.reshape(1, -1)
            elif raw_data.shape[0] > raw_data.shape[1] and raw_data.shape[1] <= 64:
                # Transpose (time, channels) -> (channels, time)
                raw_data = raw_data.T

            channel_names = list(CLEAN_64_CHANNELS[: raw_data.shape[0]])
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Could not parse NumPy file: {str(e)}",
            )

    # 3. Handle CSV
    elif filename.endswith(".csv"):
        try:
            bio = io.StringIO(contents.decode("utf-8"))
            arr = np.genfromtxt(bio, delimiter=",", dtype=np.float32)
            if arr.ndim == 1:
                arr = arr.reshape(1, -1)
            elif arr.shape[0] > arr.shape[1] and arr.shape[1] <= 64:
                arr = arr.T
            raw_data = arr
            channel_names = list(CLEAN_64_CHANNELS[: raw_data.shape[0]])
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Could not parse CSV file: {str(e)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension for '{filename}'. Allowed: .edf, .npy, .npz, .csv",
        )

    # Validate raw data
    if raw_data is None or raw_data.size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parsed EEG data is empty.",
        )

    # Generate unique trial identifier
    trial_id = f"trial_{uuid.uuid4().hex[:12]}"

    # Run complete preprocessing pipeline (resample, CAR, ICA band-split, symmetric pairs)
    try:
        samples, pair_dict = preprocessor.preprocess_trial(
            raw_data=raw_data,
            channel_names=channel_names,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preprocessing failed: {str(e)}",
        )

    # Downsample raw preview from C3 or channel 0 (128 points)
    raw_ch_idx = 0
    for idx, ch in enumerate(channel_names):
        if clean_channel_name(ch) in ["C3", "CZ", "C4"]:
            raw_ch_idx = idx
            break
    ch_sig = raw_data[raw_ch_idx]
    step = max(1, len(ch_sig) // 128)
    raw_preview = ch_sig[::step][:128].astype(np.float32)

    # Infer ground truth if PhysioNet EDF run and annotation are recognized
    gt_class: Optional[int] = None
    gt_code: Optional[str] = None
    gt_label: Optional[str] = None
    status_msg = "Trial uploaded, validated, and preprocessed successfully into motor-cortex feature representations."

    if detected_run in [1, 2]:
        status_msg = f"PhysioNet Run R{detected_run:02d} recognized as baseline recording ({'Eyes Open' if detected_run == 1 else 'Eyes Closed'}). No motor task labels."
    elif detected_run is not None and detected_ann is not None:
        # Runs 03, 07, 11 (execution) & 04, 08, 12 (imagery): Left Fist vs Right Fist
        if detected_run in [3, 4, 7, 8, 11, 12]:
            run_type = "Execution" if detected_run in [3, 7, 11] else "Imagery"
            if detected_ann == "T1":
                gt_class, gt_code, gt_label = 0, "T1", "Left Fist (L)"
            elif detected_ann == "T2":
                gt_class, gt_code, gt_label = 1, "T2", "Right Fist (R)"
            if gt_label:
                status_msg = f"PhysioNet Run R{detected_run:02d} ({run_type} {detected_ann}) recognized: Ground Truth is {gt_code} ({gt_label})."
        # Runs 05, 09, 13 (execution) & 06, 10, 14 (imagery): Both Fists vs Both Feet
        elif detected_run in [5, 6, 9, 10, 13, 14]:
            run_type = "Execution" if detected_run in [5, 9, 13] else "Imagery"
            if detected_ann == "T1":
                gt_class, gt_code, gt_label = 2, "T3", "Both Fists (BLR)"
            elif detected_ann == "T2":
                gt_class, gt_code, gt_label = 3, "T4", "Both Feet (BF)"
            if gt_label:
                status_msg = f"PhysioNet Run R{detected_run:02d} ({run_type} {detected_ann}) recognized: Ground Truth is {gt_code} ({gt_label})."

    # Persist preprocessed trial
    n_samples = raw_data.shape[1]
    duration_s = round(n_samples / sampling_rate, 2)
    metadata = {
        "trial_id": trial_id,
        "original_filename": filename,
        "channels": channel_names,
        "original_fs": sampling_rate,
        "target_fs": 128.0,
        "duration_s": duration_s,
        "ground_truth_class": gt_class,
        "ground_truth_code": gt_code,
        "ground_truth_label": gt_label,
    }
    model_service.save_trial(trial_id, samples, pair_dict, metadata, raw_preview=raw_preview)

    return UploadResponse(
        trial_id=trial_id,
        channels=[clean_channel_name(ch) for ch in channel_names[:10]],  # first 10 for concise response
        num_channels=len(channel_names),
        duration_s=duration_s,
        sampling_rate=128.0,
        samples_per_channel=samples.shape[1],
        message=status_msg,
        ground_truth_class=gt_class,
        ground_truth_code=gt_code,
        ground_truth_label=gt_label,
        dataset_name=f"PhysioNet {filename.upper()}" if detected_run else None,
    )


@router.get(
    "/trial/{trial_id}/signals",
    summary="Get downsampled raw and bandpass-filtered signals for trial explanation",
)
async def get_trial_signals(trial_id: str):
    """Retrieve downsampled raw waveform and 5-pair motor cortex bandpass-filtered signals."""
    try:
        return model_service.get_trial_signals(trial_id)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trial '{trial_id}' not found.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trial signals: {str(e)}",
        )


@router.get(
    "/sample-datasets",
    response_model=List[BenchmarkDatasetInfo],
    summary="List available 10 diverse PhysioNet benchmark datasets",
)
async def list_benchmark_datasets() -> List[BenchmarkDatasetInfo]:
    """Returns metadata for 10 diverse PhysioNet benchmark trials (S001, S002, S003, S089)."""
    return benchmark_manager.get_dataset_list()


@router.post(
    "/sample-trial",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Load a real pre-packaged PhysioNet trial (specific dataset or random)",
)
async def load_sample_trial(
    dataset_id: Optional[str] = Query(None, description="Benchmark dataset ID (e.g. ds_01..ds_10)"),
    random_pick: bool = Query(False, description="Whether to pick a random dataset from the 10 benchmarks"),
) -> UploadResponse:
    """Loads a real motor-imagery trial from the curated 10 benchmark datasets with ground-truth verification."""
    try:
        _, response = benchmark_manager.load_trial(dataset_id=dataset_id, random_pick=random_pick)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load sample trial: {str(e)}",
        )


@router.post(
    "/benchmark-10",
    response_model=Benchmark10Response,
    summary="Batch evaluate all 10 random benchmark datasets and judge model performance",
)
async def benchmark_10_datasets(
    model: str = Query("both", description="Model to evaluate: 'minirocket', 'cnn_lstm', or 'both'"),
) -> Benchmark10Response:
    """Evaluates all 10 benchmark datasets across MiniRocket and CNN-LSTM models,
    returning detailed per-dataset predictions, ground truth verification, and accuracy metrics.
    """
    try:
        return benchmark_manager.evaluate_10_datasets(model_choice=model)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch benchmark failed: {str(e)}",
        )
