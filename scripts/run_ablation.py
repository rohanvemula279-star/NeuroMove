"""Controlled Preprocessing Ablation Study for NeuroMove.
Paper Reference: Hwaidi & Ghanem (NeuroImage 328, 2026).

Isolates whether the preprocessing pipeline (ICA-based band isolation and 5-pair reduction)
is responsible for the remaining gap, or whether strict zero-leakage evaluation imposes
a genuine neurophysiological ceiling on this 4-subject dataset.

Ablations:
  - Baseline: FastICA mu/beta isolation + C3-C4 serial pair (34.55% validated baseline)
  - Ablation 1: Standard zero-phase Butterworth bandpass (8-30 Hz) directly on channels + C3-C4
  - Ablation 2: Bandpass (8-30 Hz) + Wider channel sets (5 symmetric pairs & 21 motor cortex channels)
  - Ablation 3: Reference ceiling: Multiclass CSP + LDA on 8-30 Hz bandpass signals across all channels

Usage:
  python scripts/run_ablation.py --ablation all --subjects S001,S002,S003,S004
  python scripts/run_ablation.py --ablation 1
  python scripts/run_ablation.py --ablation 2
  python scripts/run_ablation.py --ablation 3
"""

import argparse
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import joblib

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import RidgeClassifierCV
from mne.decoding import CSP

from app.data.loader import PhysioNetLoader, normalize_subject_id
from app.data.preprocessing import (
    EEGPreprocessor,
    clean_channel_name,
    extract_electrode_pairs,
    MOTOR_CORTEX_PAIRS,
    MOTOR_CORTEX_21,
)
from app.models.minirocket_pipeline import MiniRocketPipeline, MiniRocketTransform
from app.services.metrics import MetricsCalculator

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)


def parse_args():
    parser = argparse.ArgumentParser(description="Run controlled preprocessing ablations.")
    parser.add_argument(
        "--ablation",
        type=str,
        default="all",
        choices=["1", "2", "3", "all"],
        help="Ablation to run: 1 (Bandpass), 2 (Wider channels), 3 (CSP+LDA), all (All 3).",
    )
    parser.add_argument(
        "--subjects",
        type=str,
        default="S001,S002,S003,S004",
        help="Comma-separated subject IDs (default: S001,S002,S003,S004).",
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data/physionet",
        help="Path to local PhysioNet data.",
    )
    parser.add_argument(
        "--kernels",
        type=int,
        default=10000,
        help="Number of MiniRocket kernels (default: 10,000).",
    )
    parser.add_argument(
        "--max-dilations",
        type=int,
        default=28,
        help="Max dilations for MiniRocket (default: 28).",
    )
    parser.add_argument(
        "--trials-per-task",
        type=int,
        default=21,
        help="Trials per class (default: 21 -> 84 trials total).",
    )
    parser.add_argument(
        "--samples-per-trial",
        type=int,
        default=9,
        help="Sub-windows per trial (default: 9).",
    )
    parser.add_argument(
        "--no-cache",
        action="store_true",
        help="Force re-run without reading from .ablation_cache.",
    )
    parser.add_argument(
        "--artifacts-dir",
        type=str,
        default="artifacts",
        help="Artifacts directory.",
    )
    return parser.parse_args()


def load_raw_subject_records(
    subjects: List[str], data_dir: Path, trials_per_task: int = 21
) -> Dict[str, List[Tuple[np.ndarray, int, List[str]]]]:
    """Load and balance exactly 84 raw trials (21 per class) per subject."""
    loader = PhysioNetLoader(data_dir=data_dir)
    subject_raw_data = {}

    for sub in subjects:
        norm_sub = normalize_subject_id(sub)
        print(f"Loading raw recordings for {norm_sub}...")
        try:
            trial_records, summary = loader.load_subject_trials(
                norm_sub, download_if_missing=False, return_summary=True
            )
        except Exception as e:
            print(f"  Error loading {norm_sub}: {e}")
            trial_records = []

        if not trial_records:
            print(f"  Warning: No local EDF files for {norm_sub}, generating synthetic fallback...")
            synth = loader.generate_synthetic_dataset([norm_sub], trials_per_task=trials_per_task)
            trial_records = synth.get(norm_sub, [])

        class_groups = {c: [] for c in range(4)}
        for item in trial_records:
            raw_data, label, ch_names = item[0], item[1], item[2]
            class_groups[label].append((raw_data, label, ch_names))

        balanced_records = []
        for c in range(4):
            avail = len(class_groups[c])
            if avail < trials_per_task:
                print(f"  Notice: {norm_sub} class T{c+1} has {avail} trials (< {trials_per_task}).")
                balanced_records.extend(class_groups[c])
            else:
                balanced_records.extend(class_groups[c][:trials_per_task])

        print(f"  {norm_sub}: Loaded {len(balanced_records)} balanced raw trials ({len(balanced_records)//4} per class).")
        subject_raw_data[norm_sub] = balanced_records

    return subject_raw_data


def run_minirocket_10fold_cv(
    subject_preprocessed_trials: Dict[str, List[Tuple[np.ndarray, int, str, int]]],
    num_kernels: int = 10000,
    max_dilations: int = 28,
    cache_tag: str = "exp",
    cache_dir: Optional[Path] = None,
    no_cache: bool = False,
) -> Dict[str, Dict[str, Any]]:
    """Run Stratified 10-fold CV on preprocessed trials with 0% window leakage."""
    results = {}

    for sub_id, trials in subject_preprocessed_trials.items():
        cache_file = cache_dir / f"{cache_tag}_{sub_id}.joblib" if cache_dir else None
        if not no_cache and cache_file and cache_file.exists():
            print(f"  [CACHE HIT] Loaded {sub_id} ({cache_tag}):")
            cached = joblib.load(cache_file)
            results[sub_id] = cached
            mean_acc = np.mean(cached["fold_accuracies"])
            std_acc = np.std(cached["fold_accuracies"])
            print(f"    --> Mean: {mean_acc*100:.2f}% (+/- {std_acc*100:.2f}%)")
            continue

        trial_labels = np.array([t[1] for t in trials])
        n_trials = len(trials)
        min_class_count = min(np.bincount(trial_labels, minlength=4))
        n_splits = min(10, min_class_count)

        skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        fold_accs = []
        y_true_all = []
        y_pred_all = []
        y_probs_all = []
        t0 = time.perf_counter()

        print(f"  Running 10-Fold CV for {sub_id} ({cache_tag})...")
        for fold_idx, (train_trial_idx, test_trial_idx) in enumerate(skf.split(trials, trial_labels)):
            X_tr_list, y_tr_list = [], []
            for idx in train_trial_idx:
                samples, label, _, _ = trials[idx]
                for s in samples:
                    X_tr_list.append(s)
                    y_tr_list.append(label)

            X_te_list, y_te_list = [], []
            for idx in test_trial_idx:
                samples, label, _, _ = trials[idx]
                for s in samples:
                    X_te_list.append(s)
                    y_te_list.append(label)

            X_tr = np.array(X_tr_list, dtype=np.float32)
            y_tr = np.array(y_tr_list, dtype=np.int64)
            X_te = np.array(X_te_list, dtype=np.float32)
            y_te = np.array(y_te_list, dtype=np.int64)

            mr = MiniRocketPipeline(
                num_kernels=num_kernels,
                max_dilations=max_dilations,
                random_state=42 + fold_idx,
            )
            mr.fit(X_tr, y_tr)
            probs = mr.predict_proba(X_te)
            preds = np.argmax(probs, axis=1)
            acc = float(accuracy_score(y_te, preds))
            fold_accs.append(acc)

            y_true_all.extend(y_te)
            y_pred_all.extend(preds)
            y_probs_all.extend(probs)

        train_time = time.perf_counter() - t0
        mean_acc = float(np.mean(fold_accs))
        std_acc = float(np.std(fold_accs))
        p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
            y_true_all, y_pred_all, average="macro", zero_division=0
        )

        sub_res = {
            "fold_accuracies": fold_accs,
            "mean_accuracy": mean_acc,
            "std_accuracy": std_acc,
            "macro_f1": float(f1_macro),
            "y_true": np.array(y_true_all, dtype=np.int64),
            "y_pred": np.array(y_pred_all, dtype=np.int64),
            "y_probs": np.array(y_probs_all, dtype=np.float32),
            "train_time_s": train_time,
        }
        results[sub_id] = sub_res
        if cache_file:
            joblib.dump(sub_res, cache_file)

        print(f"    --> {sub_id} Mean: {mean_acc*100:.2f}% (+/- {std_acc*100:.2f}%) [{train_time:.1f}s]")

    return results


def run_minirocket_5pairs_fusion_10fold_cv(
    raw_records: Dict[str, List[Tuple[np.ndarray, int, List[str]]]],
    cache_dir: Optional[Path] = None,
    no_cache: bool = False,
    samples_per_trial: int = 9,
    kernels_per_pair: int = 2000,
    max_dilations: int = 28,
) -> Dict[str, Dict[str, Any]]:
    """Ablation 2: Feature-level spatial fusion across all 5 symmetric motor cortex pairs.
    Extracts 2,000 kernels per pair (10,000 kernels total across 5 pairs).
    Convolves within each pair's 512-sample time series to eliminate cross-channel boundary artifacts.
    """
    preproc = EEGPreprocessor(filter_method="bandpass", samples_per_trial=samples_per_trial)
    results = {}

    pair_names = ["FC3-FC4", "C5-C6", "C3-C4", "C1-C2", "CP3-CP4"]
    pairs_tuples = [("FC3", "FC4"), ("C5", "C6"), ("C3", "C4"), ("C1", "C2"), ("CP3", "CP4")]

    for sub_id, records in raw_records.items():
        cache_file = cache_dir / f"mr_bp_5pairs_fusion_{sub_id}.joblib" if cache_dir else None
        if not no_cache and cache_file and cache_file.exists():
            print(f"  [CACHE HIT] Loaded {sub_id} (5-Pair Fusion):")
            cached = joblib.load(cache_file)
            results[sub_id] = cached
            mean_acc = np.mean(cached["fold_accuracies"])
            std_acc = np.std(cached["fold_accuracies"])
            print(f"    --> Mean: {mean_acc*100:.2f}% (+/- {std_acc*100:.2f}%)")
            continue

        # Preprocess each trial
        trials_data = []
        trial_labels = []
        for raw_d, lbl, ch_n in records:
            filtered = preproc.preprocess_full_trial(raw_d, ch_n)
            pair_dict = extract_electrode_pairs(filtered, ch_n, pairs=pairs_tuples)
            n_time = filtered.shape[1]  # 512
            sub_win_len = 256
            step = (n_time - sub_win_len) / (samples_per_trial - 1) if samples_per_trial > 1 else 0

            trial_sub_wins = []
            for s_i in range(samples_per_trial):
                start = int(round(s_i * step)) if step > 0 else 0
                end = start + sub_win_len
                sub_pairs = []
                for p_k in pair_names:
                    p_sig = pair_dict.get(p_k, list(pair_dict.values())[0])
                    l_sub = p_sig[start:end]
                    r_sub = p_sig[n_time + start : n_time + end]
                    sub_pairs.append(np.concatenate([l_sub, r_sub]))
                trial_sub_wins.append(np.array(sub_pairs, dtype=np.float32))  # (5, 512)
            trials_data.append(np.array(trial_sub_wins, dtype=np.float32))  # (9, 5, 512)
            trial_labels.append(lbl)

        trials_arr = np.array(trials_data, dtype=np.float32)  # (84, 9, 5, 512)
        y_arr = np.array(trial_labels, dtype=np.int64)

        skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
        fold_accs = []
        y_true_all = []
        y_pred_all = []
        t0 = time.perf_counter()

        print(f"  Running 10-Fold CV for {sub_id} (5-Pair Fusion)...")
        for fold_idx, (train_trial_idx, test_trial_idx) in enumerate(skf.split(trials_arr, y_arr)):
            X_tr_stacked = trials_arr[train_trial_idx].reshape(-1, 5, 512)
            y_tr = np.repeat(y_arr[train_trial_idx], samples_per_trial)
            X_te_stacked = trials_arr[test_trial_idx].reshape(-1, 5, 512)
            y_te = np.repeat(y_arr[test_trial_idx], samples_per_trial)

            tr_feats = []
            te_feats = []
            for p_idx in range(5):
                X_tr_p = X_tr_stacked[:, p_idx, :]  # (N_tr, 512)
                X_te_p = X_te_stacked[:, p_idx, :]  # (N_te, 512)
                mr_p = MiniRocketTransform(
                    num_kernels=kernels_per_pair,
                    max_dilations=max_dilations,
                    random_state=42 + fold_idx * 10 + p_idx,
                )
                tr_feats.append(mr_p.fit_transform(X_tr_p))
                te_feats.append(mr_p.transform(X_te_p))

            X_tr_f = np.concatenate(tr_feats, axis=1)  # (N_tr, 10000)
            X_te_f = np.concatenate(te_feats, axis=1)  # (N_te, 10000)

            scaler = StandardScaler()
            X_tr_s = scaler.fit_transform(X_tr_f)
            X_te_s = scaler.transform(X_te_f)

            ridge = RidgeClassifierCV(alphas=np.logspace(-1, 5, 10), cv=None)
            ridge.fit(X_tr_s, y_tr)
            preds = ridge.predict(X_te_s)
            acc = float(accuracy_score(y_te, preds))
            fold_accs.append(acc)
            y_true_all.extend(y_te)
            y_pred_all.extend(preds)

        train_time = time.perf_counter() - t0
        mean_acc = float(np.mean(fold_accs))
        std_acc = float(np.std(fold_accs))
        p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
            y_true_all, y_pred_all, average="macro", zero_division=0
        )

        sub_res = {
            "fold_accuracies": fold_accs,
            "mean_accuracy": mean_acc,
            "std_accuracy": std_acc,
            "macro_f1": float(f1_macro),
            "y_true": np.array(y_true_all, dtype=np.int64),
            "y_pred": np.array(y_pred_all, dtype=np.int64),
            "train_time_s": train_time,
        }
        results[sub_id] = sub_res
        if cache_file:
            joblib.dump(sub_res, cache_file)

        print(f"    --> {sub_id} 5-Pair Fusion Mean: {mean_acc*100:.2f}% (+/- {std_acc*100:.2f}%) [{train_time:.1f}s]")

    return results


def run_csp_lda_10fold_cv(
    raw_subject_records: Dict[str, List[Tuple[np.ndarray, int, List[str]]]],
    cache_dir: Optional[Path] = None,
    no_cache: bool = False,
) -> Dict[str, Dict[str, Any]]:
    """Ablation 3: Classical Multiclass CSP + LDA Reference Benchmark on full trials."""
    preproc = EEGPreprocessor(filter_method="bandpass", l_freq=8.0, h_freq=30.0)
    results = {}

    print("\n" + "=" * 76)
    print("  ABLATION 3: MULTICLASS CSP + LINEAR DISCRIMINANT ANALYSIS (REFERENCE)  ")
    print("  Zero-phase Butterworth (8-30 Hz) + CAR + Full 64 Channels             ")
    print("=" * 76)

    for sub_id, records in raw_subject_records.items():
        cache_file = cache_dir / f"csp_lda_{sub_id}.joblib" if cache_dir else None
        if not no_cache and cache_file and cache_file.exists():
            print(f"  [CACHE HIT] Loaded {sub_id} (CSP+LDA):")
            cached = joblib.load(cache_file)
            results[sub_id] = cached
            mean_acc = np.mean(cached["fold_accuracies"])
            std_acc = np.std(cached["fold_accuracies"])
            print(f"    --> Mean: {mean_acc*100:.2f}% (+/- {std_acc*100:.2f}%)")
            continue

        # Preprocess full trials (64 channels, 512 samples)
        X_trials = []
        y_trials = []
        for raw_data, label, ch_names in records:
            filtered = preproc.preprocess_full_trial(raw_data, ch_names)
            X_trials.append(filtered)
            y_trials.append(label)

        X_arr = np.array(X_trials, dtype=np.float64)  # (84, 64, 512)
        y_arr = np.array(y_trials, dtype=np.int64)

        skf = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)
        fold_accs = []
        y_true_all = []
        y_pred_all = []
        t0 = time.perf_counter()

        print(f"  Running 10-Fold CV for {sub_id} (CSP+LDA)...")
        for fold_idx, (train_idx, test_idx) in enumerate(skf.split(X_arr, y_arr)):
            X_tr, y_tr = X_arr[train_idx], y_arr[train_idx]
            X_te, y_te = X_arr[test_idx], y_arr[test_idx]

            # Fit multiclass CSP strictly on training split (0% leakage)
            csp = CSP(n_components=6, log=True, cov_est="concat")
            X_tr_csp = csp.fit_transform(X_tr, y_tr)
            X_te_csp = csp.transform(X_te)

            # Fit LDA on CSP features
            lda = LinearDiscriminantAnalysis(solver="lsqr", shrinkage="auto")
            lda.fit(X_tr_csp, y_tr)

            preds = lda.predict(X_te_csp)
            acc = float(accuracy_score(y_te, preds))
            fold_accs.append(acc)

            y_true_all.extend(y_te)
            y_pred_all.extend(preds)

        train_time = time.perf_counter() - t0
        mean_acc = float(np.mean(fold_accs))
        std_acc = float(np.std(fold_accs))
        p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
            y_true_all, y_pred_all, average="macro", zero_division=0
        )

        sub_res = {
            "fold_accuracies": fold_accs,
            "mean_accuracy": mean_acc,
            "std_accuracy": std_acc,
            "macro_f1": float(f1_macro),
            "y_true": np.array(y_true_all, dtype=np.int64),
            "y_pred": np.array(y_pred_all, dtype=np.int64),
            "train_time_s": train_time,
        }
        results[sub_id] = sub_res
        if cache_file:
            joblib.dump(sub_res, cache_file)

        print(f"    --> {sub_id} CSP+LDA Mean: {mean_acc*100:.2f}% (+/- {std_acc*100:.2f}%) [{train_time:.1f}s]")

    return results


def get_acc_stats(result_dict: Optional[Dict[str, Any]]) -> Tuple[float, float]:
    if not result_dict:
        return 0.0, 0.0
    if "mean_accuracy" in result_dict and result_dict["mean_accuracy"] is not None:
        return float(result_dict["mean_accuracy"]), float(result_dict.get("std_accuracy", 0.0))
    if "fold_accuracies" in result_dict and len(result_dict["fold_accuracies"]) > 0:
        return float(np.mean(result_dict["fold_accuracies"])), float(np.std(result_dict["fold_accuracies"]))
    return 0.0, 0.0


def main():
    args = parse_args()
    artifacts_dir = Path(args.artifacts_dir)
    cache_dir = artifacts_dir / ".ablation_cache"
    cache_dir.mkdir(parents=True, exist_ok=True)
    raw_subjects = [s.strip() for s in args.subjects.split(",") if s.strip()]

    print("=" * 80)
    print("        NEUROMOVE: PREPROCESSING ABLATION STUDY & BENCHMARK             ")
    print("        Investigating Filtering & Channel Representation Bottlenecks   ")
    print("=" * 80)

    # 1. Load Raw Subject Records
    raw_records = load_raw_subject_records(raw_subjects, Path(args.data_dir), args.trials_per_task)

    # -------------------------------------------------------------
    # BASELINE: ICA + C3-C4 (From Existing Validated 10-Fold CV)
    # -------------------------------------------------------------
    print("\n--- Condition 0: Baseline (FastICA Mu/Beta + C3-C4 Serial Pair) ---")
    cv_cache_dir = artifacts_dir / ".cv_cache"
    baseline_results = {}
    for sub in raw_subjects:
        norm_sub = normalize_subject_id(sub)
        b_file = cv_cache_dir / f"mr_{norm_sub}_k{args.kernels}_d{args.max_dilations}.joblib"
        if b_file.exists():
            data = joblib.load(b_file)
            baseline_results[norm_sub] = data
            mean_acc = np.mean(data["fold_accuracies"])
            std_acc = np.std(data["fold_accuracies"])
            print(f"  [LOADED BASELINE] {norm_sub}: {mean_acc*100:.2f}% (+/- {std_acc*100:.2f}%)")
        else:
            print(f"  Baseline cache for {norm_sub} not found. Running baseline ICA...")
            preproc_ica = EEGPreprocessor(filter_method="ica", channel_mode="c3_c4", samples_per_trial=args.samples_per_trial)
            trials_ica = {
                norm_sub: [
                    (preproc_ica.preprocess_trial(raw_d, ch_n)[0], lbl, norm_sub, t_i)
                    for t_i, (raw_d, lbl, ch_n) in enumerate(raw_records[norm_sub])
                ]
            }
            res_ica = run_minirocket_10fold_cv(
                trials_ica, args.kernels, args.max_dilations, cache_tag=f"mr_{norm_sub}", cache_dir=cv_cache_dir, no_cache=args.no_cache
            )
            baseline_results[norm_sub] = res_ica[norm_sub]

    # -------------------------------------------------------------
    # ABLATION 1: Bandpass (8-30 Hz Butterworth) + C3-C4
    # -------------------------------------------------------------
    ablation1_results = {}
    if args.ablation in ["1", "all"]:
        print("\n" + "=" * 76)
        print("  ABLATION 1: ZERO-PHASE BUTTERWORTH (8-30 Hz) vs. FASTICA BAND ISOLATION ")
        print("  Direct channel filtering without FastICA, C3-C4 pair (512 length)     ")
        print("=" * 76)
        preproc_bp = EEGPreprocessor(filter_method="bandpass", channel_mode="c3_c4", samples_per_trial=args.samples_per_trial)
        trials_bp = {}
        for sub_id, recs in raw_records.items():
            trials_bp[sub_id] = [
                (preproc_bp.preprocess_trial(raw_d, ch_n)[0], lbl, sub_id, t_i)
                for t_i, (raw_d, lbl, ch_n) in enumerate(recs)
            ]
        ablation1_results = run_minirocket_10fold_cv(
            trials_bp, args.kernels, args.max_dilations, cache_tag="mr_bp_c3c4", cache_dir=cache_dir, no_cache=args.no_cache
        )

    # -------------------------------------------------------------
    # ABLATION 2: Bandpass (8-30 Hz) + Wider Channels (5 Pairs & 21-MC)
    # -------------------------------------------------------------
    ablation2_results = {}
    if args.ablation in ["2", "all"]:
        print("\n" + "=" * 76)
        print("  ABLATION 2: WIDER MOTOR CORTEX CHANNELS (5 PAIRS & 21 CHANNELS)       ")
        print("  Zero-phase Butterworth (8-30 Hz) + Extended Spatial Information        ")
        print("=" * 76)

        # 2a. All 5 symmetric motor cortex pairs with feature-level spatial fusion
        print("\n--- 2a. All 5 Symmetric Motor Cortex Pairs (FC3-FC4, C5-C6, C3-C4, C1-C2, CP3-CP4) ---")
        ablation2_results = run_minirocket_5pairs_fusion_10fold_cv(
            raw_records, cache_dir=cache_dir, no_cache=args.no_cache, samples_per_trial=args.samples_per_trial
        )

    # -------------------------------------------------------------
    # ABLATION 3: CSP + LDA Reference Benchmark (Full 64 Channels)
    # -------------------------------------------------------------
    ablation3_results = {}
    if args.ablation in ["3", "all"]:
        ablation3_results = run_csp_lda_10fold_cv(raw_records, cache_dir=cache_dir, no_cache=args.no_cache)

    # -------------------------------------------------------------
    # FINAL COMPARISON TABLE DELIVERABLE
    # -------------------------------------------------------------
    print("\n" + "=" * 105)
    print("                       NEUROMOVE PREPROCESSING ABLATION BENCHMARK RESULTS                        ")
    print("=" * 105)
    header = f"{'Subject':<8} | {'Baseline (ICA+C3C4)':<20} | {'Ablation 1 (BP+C3C4)':<20} | {'Ablation 2 (BP+5Pairs)':<22} | {'Ablation 3 (CSP+LDA)':<20}"
    print(header)
    print("-" * 105)

    subs = sorted(raw_records.keys())
    b_accs, a1_accs, a2_accs, a3_accs = [], [], [], []

    for sub in subs:
        b_val, b_std = get_acc_stats(baseline_results.get(sub))
        b_str = f"{b_val*100:5.2f}% +/- {b_std*100:4.2f}%" if b_val > 0 else "N/A"
        if b_val > 0: b_accs.append(b_val)

        a1_val, a1_std = get_acc_stats(ablation1_results.get(sub))
        a1_str = f"{a1_val*100:5.2f}% +/- {a1_std*100:4.2f}%" if a1_val > 0 else "N/A"
        if a1_val > 0: a1_accs.append(a1_val)

        a2_val, a2_std = get_acc_stats(ablation2_results.get(sub))
        a2_str = f"{a2_val*100:5.2f}% +/- {a2_std*100:4.2f}%" if a2_val > 0 else "N/A"
        if a2_val > 0: a2_accs.append(a2_val)

        a3_val, a3_std = get_acc_stats(ablation3_results.get(sub))
        a3_str = f"{a3_val*100:5.2f}% +/- {a3_std*100:4.2f}%" if a3_val > 0 else "N/A"
        if a3_val > 0: a3_accs.append(a3_val)

        print(f"{sub:<8} | {b_str:<20} | {a1_str:<20} | {a2_str:<22} | {a3_str:<20}")

    print("-" * 105)
    mean_b = f"{np.mean(b_accs)*100:5.2f}%" if b_accs else "N/A"
    mean_a1 = f"{np.mean(a1_accs)*100:5.2f}%" if a1_accs else "N/A"
    mean_a2 = f"{np.mean(a2_accs)*100:5.2f}%" if a2_accs else "N/A"
    mean_a3 = f"{np.mean(a3_accs)*100:5.2f}%" if a3_accs else "N/A"
    print(f"{'AVERAGE':<8} | {mean_b:<20} | {mean_a1:<20} | {mean_a2:<22} | {mean_a3:<20}")
    print("=" * 105)

    # Save summary artifact
    summary_artifact = {
        "baseline_ica_c3c4": {s: baseline_results.get(s, {}).get("mean_accuracy") for s in subs},
        "ablation1_bandpass_c3c4": {s: ablation1_results.get(s, {}).get("mean_accuracy") for s in subs},
        "ablation2_bandpass_5pairs": {s: ablation2_results.get(s, {}).get("mean_accuracy") for s in subs},
        "ablation3_csp_lda": {s: ablation3_results.get(s, {}).get("mean_accuracy") for s in subs},
        "average_baseline": float(np.mean(b_accs)) if b_accs else None,
        "average_ablation1": float(np.mean(a1_accs)) if a1_accs else None,
        "average_ablation2": float(np.mean(a2_accs)) if a2_accs else None,
        "average_ablation3": float(np.mean(a3_accs)) if a3_accs else None,
    }
    summary_path = artifacts_dir / "ablation_summary.joblib"
    joblib.dump(summary_artifact, summary_path)
    print(f"\nAblation summary saved to: {summary_path}")


if __name__ == "__main__":
    main()
