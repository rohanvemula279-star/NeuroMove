"""Prediction and Inference CLI for NeuroMove Motor Imagery Classification.
Loads the trained high-accuracy model and generates predictions for:
  - Any PhysioNet EDF recording file
  - Specific subjects (Person-1 to Person-5)
  - Raw NumPy trial arrays
  - The held-out test set
"""

import argparse
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import joblib
import mne
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.data.loader import PhysioNetLoader, normalize_subject_id
from app.data.preprocessing import EEGPreprocessor
from app.models.minirocket_pipeline import MiniRocketPipeline

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

CLASS_LABELS = {
    0: "T1: Left Fist (L)",
    1: "T2: Right Fist (R)",
    2: "T3: Both Fists (BLR)",
    3: "T4: Both Feet (BF)",
}

SHORT_NAMES = {
    0: "Left Fist",
    1: "Right Fist",
    2: "Both Fists",
    3: "Both Feet",
}


def parse_args():
    parser = argparse.ArgumentParser(description="Predict Motor Imagery EEG intent from trained NeuroMove model.")
    parser.add_argument(
        "--model-path",
        type=str,
        default="artifacts/minirocket.joblib",
        help="Path to trained MiniRocket model joblib file (default: artifacts/minirocket.joblib).",
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Path to a single EDF recording file or NumPy array file (.npy) to predict.",
    )
    parser.add_argument(
        "--subject",
        type=str,
        default=None,
        help="Predict trials for a specific subject (e.g. 'Person-1', 'Person-3', 'S001').",
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default="datasets",
        help="Directory containing datasets (default: datasets).",
    )
    parser.add_argument(
        "--trials",
        type=int,
        default=10,
        help="Maximum number of trials to display in detailed prediction table (default: 10).",
    )
    parser.add_argument(
        "--eval-test",
        action="store_true",
        help="Run inference on the saved held-out test set and report sample-level predictions and accuracy.",
    )
    return parser.parse_args()


def load_trained_model(model_path: Path) -> MiniRocketPipeline:
    """Load the trained MiniRocket pipeline from disk."""
    if not model_path.exists():
        # Fallback to minirocket_90plus.joblib if available
        fallback = model_path.parent / "minirocket_90plus.joblib"
        if fallback.exists():
            model_path = fallback
        else:
            raise FileNotFoundError(
                f"Model file not found at {model_path}. Please run 'python scripts/train_high_accuracy.py' first."
            )
    print(f"Loaded trained model from: {model_path}")
    model = MiniRocketPipeline.load(model_path)
    return model


def predict_from_edf(
    file_path: Path,
    model: MiniRocketPipeline,
    max_trials: int = 10,
):
    """Run inference directly on an EDF recording file."""
    print(f"\n=======================================================")
    print(f"  PREDICTING FROM FILE: {file_path.name}")
    print(f"=======================================================")

    raw = mne.io.read_raw_edf(str(file_path), preload=True, verbose=False)
    events, event_dict = mne.events_from_annotations(raw, verbose=False)
    sfreq = raw.info["sfreq"]
    ch_names = raw.ch_names
    raw_data = raw.get_data()

    print(f"Sampling frequency: {sfreq} Hz | Channels: {len(ch_names)} | Duration: {raw_data.shape[1]/sfreq:.1f} s")
    print(f"Detected events: {event_dict}")

    # Determine run number from filename to identify task type
    name = file_path.stem.upper()
    run_num = -1
    for part in name.split("_"):
        if "R" in part and len(part) >= 3:
            try:
                run_num = int(part[part.index("R")+1:part.index("R")+3])
            except Exception:
                pass
    if run_num == -1 and "R" in name:
        try:
            r_idx = name.index("R")
            run_num = int(name[r_idx+1:r_idx+3])
        except Exception:
            pass

    preprocessor = EEGPreprocessor(samples_per_trial=9, filter_method="bandpass", channel_mode="5_pairs")

    if run_num in [1, 2]:
        print(f"NOTICE: {file_path.name} is a baseline run (R0{run_num}: {'Eyes Open' if run_num == 1 else 'Eyes Closed'}). It contains no motor task cue labels.")

    # Extract 4s trials
    trial_data_list = []
    trial_labels = []
    trial_times = []

    for ev in events:
        t_sample = ev[0]
        ev_id = ev[2]
        ann = [k for k, v in event_dict.items() if v == ev_id][0]
        if ann == "T0":
            continue

        target_class = -1
        # Runs 03, 07, 11 (execution) & 04, 08, 12 (imagery): Left Fist (0) vs Right Fist (1)
        if run_num in [3, 4, 7, 8, 11, 12]:
            target_class = 0 if ann == "T1" else (1 if ann == "T2" else -1)
        # Runs 05, 09, 13 (execution) & 06, 10, 14 (imagery): Both Fists (2) vs Both Feet (3)
        elif run_num in [5, 6, 9, 10, 13, 14]:
            target_class = 2 if ann == "T1" else (3 if ann == "T2" else -1)

        end_idx = int(t_sample + 4.0 * sfreq)
        if end_idx <= raw_data.shape[1]:
            trial_signal = raw_data[:, t_sample:end_idx]
            trial_data_list.append(trial_signal)
            trial_labels.append(target_class)
            trial_times.append(t_sample / sfreq)

    if not trial_data_list:
        print("No motor imagery task intervals (T1/T2) found in annotations. Running sliding window inference across entire recording...")
        # Slice into 4-second blocks
        block_len = int(4.0 * sfreq)
        for start in range(0, raw_data.shape[1] - block_len, block_len):
            trial_data_list.append(raw_data[:, start:start+block_len])
            trial_labels.append(-1)
            trial_times.append(start / sfreq)

    print(f"\nExtracted {len(trial_data_list)} 4-second trials for prediction.")
    print("-" * 88)
    print(f"{'Trial':<6} | {'Time (s)':<8} | {'Predicted Intent':<22} | {'Confidence':<10} | {'Ground Truth':<20} | {'Match'}")
    print("-" * 88)

    correct = 0
    evaluated = 0

    display_count = min(len(trial_data_list), max_trials)

    for i in range(len(trial_data_list)):
        trial_sig = trial_data_list[i]
        true_label = trial_labels[i]
        t_time = trial_times[i]

        samples, _ = preprocessor.preprocess_trial(trial_sig, ch_names)
        probs = model.predict_proba(samples)  # (9, 4)
        avg_probs = np.mean(probs, axis=0)    # Mean across 9 sub-windows
        pred_label = int(np.argmax(avg_probs))
        conf = float(avg_probs[pred_label])

        is_match = (pred_label == true_label) if true_label != -1 else None
        if is_match is not None:
            evaluated += 1
            if is_match:
                correct += 1

        if i < display_count:
            gt_str = CLASS_LABELS.get(true_label, "Unknown")
            pred_str = CLASS_LABELS[pred_label]
            match_str = "[CORRECT]" if is_match is True else ("[WRONG]" if is_match is False else "N/A")
            print(f"{i+1:<6} | {t_time:<8.1f} | {pred_str:<22} | {conf*100:6.1f}%    | {gt_str:<20} | {match_str}")

    if display_count < len(trial_data_list):
        print(f"... ({len(trial_data_list) - display_count} more trials omitted from detailed table)")

    print("-" * 88)
    if evaluated > 0:
        acc = (correct / evaluated) * 100.0
        print(f"SUMMARY: {correct}/{evaluated} trials correctly predicted ({acc:.2f}% accuracy).")


def predict_subject(
    subject_str: str,
    data_dir: Path,
    model: MiniRocketPipeline,
    max_trials: int = 15,
):
    """Predict trials for a specified subject from datasets folder."""
    clean_sub = subject_str.strip()
    if clean_sub.lower().startswith("person-"):
        p_num = int(clean_sub.split("-")[1])
        norm_sub = f"S{p_num:03d}"
    else:
        norm_sub = normalize_subject_id(clean_sub)

    print(f"\n=======================================================")
    print(f"  PREDICTING TRIALS FOR SUBJECT: {clean_sub} ({norm_sub})")
    print(f"=======================================================")

    loader = PhysioNetLoader(data_dir=data_dir)
    preprocessor = EEGPreprocessor(samples_per_trial=9, filter_method="bandpass", channel_mode="5_pairs")

    trials = loader.load_subject_trials(norm_sub, return_summary=False)
    print(f"Loaded {len(trials)} motor imagery trials across all runs.")

    print("-" * 92)
    print(f"{'Trial':<6} | {'Predicted Intent':<22} | {'Confidence':<10} | {'Ground Truth':<22} | {'P(T1)  P(T2)  P(T3)  P(T4)':<20} | {'Match'}")
    print("-" * 92)

    correct = 0
    display_count = min(len(trials), max_trials)

    for i, (raw_data, true_label, ch_names) in enumerate(trials):
        samples, _ = preprocessor.preprocess_trial(raw_data, ch_names)
        probs = model.predict_proba(samples)
        avg_probs = np.mean(probs, axis=0)
        pred_label = int(np.argmax(avg_probs))
        conf = float(avg_probs[pred_label])

        is_match = (pred_label == true_label)
        if is_match:
            correct += 1

        if i < display_count:
            pred_name = CLASS_LABELS[pred_label]
            true_name = CLASS_LABELS[true_label]
            probs_str = f"{avg_probs[0]:.2f}  {avg_probs[1]:.2f}  {avg_probs[2]:.2f}  {avg_probs[3]:.2f}"
            status = "[PASS]" if is_match else "[FAIL]"
            print(f"{i+1:<6} | {pred_name:<22} | {conf*100:6.1f}%    | {true_name:<22} | {probs_str:<20} | {status}")

    if display_count < len(trials):
        print(f"... ({len(trials) - display_count} more trials evaluated in summary)")

    print("-" * 92)
    acc = (correct / len(trials)) * 100.0
    print(f"SUBJECT ACCURACY SUMMARY: {correct}/{len(trials)} trials correct ({acc:.2f}% accuracy).")


def evaluate_test_split(artifacts_dir: Path, model: MiniRocketPipeline, max_display: int = 15):
    """Evaluate and show predictions on the saved held-out test split."""
    test_split_file = artifacts_dir / "test_split.joblib"
    if not test_split_file.exists():
        print(f"Test split file not found at {test_split_file}. Run train_high_accuracy.py first.")
        return

    print(f"\n=======================================================")
    print(f"  EVALUATING TEST SPLIT ({test_split_file.name})")
    print(f"=======================================================")

    data = joblib.load(test_split_file)
    X_test = data["X_test"]
    y_test = data["y_test"]
    meta_test = data["meta_test"]

    probs = model.predict_proba(X_test)
    preds = np.argmax(probs, axis=1)
    acc = float(np.mean(preds == y_test)) * 100.0

    print(f"Total Test Samples: {len(X_test)}")
    print(f"Overall Test Accuracy: {acc:.2f}% (Target: 90%+)")
    print("-" * 88)
    print(f"{'Sample ID':<26} | {'Predicted Intent':<22} | {'Confidence':<10} | {'True Intent':<20} | {'Status'}")
    print("-" * 88)

    display_n = min(len(X_test), max_display)
    for i in range(display_n):
        pred_label = preds[i]
        true_label = y_test[i]
        conf = probs[i, pred_label] * 100.0
        meta = meta_test[i]
        pred_str = CLASS_LABELS[pred_label]
        true_str = CLASS_LABELS[true_label]
        status = "[CORRECT]" if pred_label == true_label else "[INCORRECT]"
        print(f"{meta:<26} | {pred_str:<22} | {conf:6.1f}%    | {true_str:<20} | {status}")

    print("-" * 88)
    print(f"FULL TEST SET RESULT: {np.sum(preds == y_test)} / {len(y_test)} correct ({acc:.2f}% accuracy).")


def main():
    args = parse_args()
    model_path = Path(args.model_path)
    model = load_trained_model(model_path)

    if args.eval_test:
        evaluate_test_split(Path("artifacts"), model, max_display=args.trials)
    elif args.file:
        predict_from_edf(Path(args.file), model, max_trials=args.trials)
    elif args.subject:
        predict_subject(args.subject, Path(args.data_dir), model, max_trials=args.trials)
    else:
        # Default behavior: run test split evaluation and display Person-1 sample predictions
        print("No specific file or subject specified. Running prediction on held-out test split and Person-1...")
        evaluate_test_split(Path("artifacts"), model, max_display=10)
        predict_subject("Person-1", Path(args.data_dir), model, max_trials=5)


if __name__ == "__main__":
    main()
