"""PhysioNet EEG Motor Movement/Imagery Database (EEGMMIDB) Loader.
Paper Reference: Hwaidi & Ghanem (NeuroImage 328, 2026), Section 3.1.
Dataset URL: https://physionet.org/content/eegmmidb/1.0.0/

The 4 motor-imagery classes:
  - T1: Left fist (L) -> Class 0
  - T2: Right fist (R) -> Class 1
  - T3: Both fists (BLR) -> Class 2
  - T4: Both feet (BF) -> Class 3

PhysioNet EEGMMIDB Motor Imagery Runs:
  - Runs 04, 08, 12: Motor imagery of left fist (T1) vs right fist (T2)
  - Runs 06, 10, 14: Motor imagery of both fists (T3) vs both feet (T4)
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import mne


STANDARD_64_CHANNELS = [
    "Fc5.", "Fc3.", "Fc1.", "Fcz.", "Fc2.", "Fc4.", "Fc6.", "C5..", "C3..", "C1..", "Cz..", "C2..", "C4..", "C6..",
    "Cp5.", "Cp3.", "Cp1.", "Cpz.", "Cp2.", "Cp4.", "Cp6.", "Fp1.", "Fpz.", "Fp2.", "Af7.", "Af3.", "Afz.", "Af4.",
    "Af8.", "F7..", "F5..", "F3..", "F1..", "Fz..", "F2..", "F4..", "F6..", "F8..", "Ft7.", "Ft8.", "T7..", "T8..",
    "T9..", "T10.", "Tp7.", "Tp8.", "P7..", "P5..", "P3..", "P1..", "Pz..", "P2..", "P4..", "P6..", "P8..", "Po7.",
    "Po3.", "Poz.", "Po4.", "Po8.", "O1..", "Oz..", "O2..", "Iz.."
]

# Standard Clean 10-10 Channel Names without trailing dots
CLEAN_64_CHANNELS = [
    ch.strip(".").upper() for ch in STANDARD_64_CHANNELS
]


def normalize_subject_id(subject: Union[int, str]) -> str:
    """Normalize subject identifier to PhysioNet format: 'S001', 'S002', etc.
    Handles inputs like 1, '1', 'S001', 's1', 'Person-1', 'person-2', 'P1'.
    """
    if isinstance(subject, int):
        return f"S{subject:03d}"
    s = str(subject).strip()
    s_upper = s.upper()
    if s_upper.startswith("PERSON-") or s_upper.startswith("PERSON"):
        parts = s.split("-") if "-" in s else s.split()
        num = int(parts[-1])
        return f"S{num:03d}"
    if s_upper.startswith("P") and s_upper[1:].isdigit():
        num = int(s_upper[1:])
        return f"S{num:03d}"
    if s_upper.startswith("S"):
        num = int(s[1:])
        return f"S{num:03d}"
    return f"S{int(s):03d}"


def get_subject_int(subject_id: str) -> int:
    """Extract integer subject number from 'S001' -> 1.
    """
    norm = normalize_subject_id(subject_id)
    return int(norm[1:])


class PhysioNetLoader:
    """Loads and organizes PhysioNet EEGMMIDB motor-imagery recordings.
    Supports local directories of EDF files, automatic downloading via MNE,
    and synthetic EEG generation for testing.
    """

    # Real motor execution runs (left/right fist vs both fists/feet)
    EXEC_RUNS_FISTS = [3, 7, 11]     # T1=left fist (0), T2=right fist (1)
    EXEC_RUNS_FEET = [5, 9, 13]      # T1=both fists (2), T2=both feet (3)
    ALL_EXEC_RUNS = [3, 5, 7, 9, 11, 13]

    # Motor imagery runs (paper primary protocol)
    MI_RUNS_FISTS = [4, 8, 12]       # T1=left fist (0), T2=right fist (1)
    MI_RUNS_FEET = [6, 10, 14]       # T1=both fists (2), T2=both feet (3)
    ALL_MI_RUNS = [4, 6, 8, 10, 12, 14]

    # Combined all motor task runs (execution + imagery)
    ALL_TASK_FISTS = [3, 4, 7, 8, 11, 12]
    ALL_TASK_FEET = [5, 6, 9, 10, 13, 14]
    ALL_TASK_RUNS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

    # Baseline-only runs (R01 = eyes open, R02 = eyes closed, no task labels)
    BASELINE_RUNS = [1, 2]

    def __init__(self, data_dir: Optional[Union[str, Path]] = None):
        if data_dir:
            p = Path(data_dir)
            self.data_dir = p.parent if p.is_file() else p
        else:
            self.data_dir = None

    def find_edf_file(self, subject_id: str, run: int) -> Optional[Path]:
        """Search for subject's run EDF file in data_dir and standard locations.
        Checks patterns like:
          - data_dir/S001/S001R04.edf
          - data_dir/S001R04.edf
          - data_dir/s001/s001r04.edf
        """
        norm_sub = normalize_subject_id(subject_id)
        run_str = f"R{run:02d}"
        target_name = f"{norm_sub}{run_str}.edf"
        target_name_lower = f"{norm_sub.lower()}{run_str.lower()}.edf"

        search_dirs = []
        if self.data_dir:
            search_dirs.append(Path(self.data_dir))

        search_dirs.extend([
            Path("datasets"),
            Path("data/physionet"),
            Path.home() / "mne_data" / "MNE-eegbci-data" / "files" / "eegmmidb" / "1.0.0",
            Path(r"C:\Users\rohan\Downloads"),
            Path(r"C:\Users\rohan\Downloads\S089"),
        ])

        sub_int = get_subject_int(norm_sub)

        for base in search_dirs:
            if not base.exists():
                continue
            candidates = [
                base / norm_sub / target_name,
                base / target_name,
                base / f"Person-{sub_int}" / target_name,
                base / f"person-{sub_int}" / target_name,
                base / norm_sub.lower() / target_name_lower,
                base / target_name_lower,
                base / norm_sub.upper() / target_name,
            ]
            for c in candidates:
                if c.exists():
                    return c
            # Fallback to glob search in base
            matches = list(base.glob(f"**/*{norm_sub}*{run_str}*.edf"))
            if matches:
                return matches[0]
        return None

    def discover_available_subjects(self) -> Dict[str, Dict[str, Any]]:
        """Scans local data directories to discover available subjects and their MI runs."""
        search_dirs = []
        if self.data_dir:
            search_dirs.append(Path(self.data_dir))
        search_dirs.extend([
            Path("data/physionet"),
            Path.home() / "mne_data" / "MNE-eegbci-data" / "files" / "eegmmidb" / "1.0.0",
            Path(r"C:\Users\rohan\Downloads"),
            Path(r"C:\Users\rohan\Downloads\S089"),
        ])

        discovered: Dict[str, Dict[str, Any]] = {}
        for base in search_dirs:
            if not base.exists():
                continue
            for edf in base.rglob("*.edf"):
                name = edf.name
                if len(name) >= 10 and (name[0] in "Ss") and (name[4] in "Rr"):
                    try:
                        sub_str = normalize_subject_id(name[:4])
                        run_num = int(name[5:7])
                        info = discovered.setdefault(sub_str, {"mi_runs": [], "other_runs": [], "paths": {}})
                        if run_num in self.ALL_MI_RUNS:
                            if run_num not in info["mi_runs"]:
                                info["mi_runs"].append(run_num)
                        else:
                            if run_num not in info["other_runs"]:
                                info["other_runs"].append(run_num)
                        info["paths"][run_num] = edf
                    except Exception:
                        pass

        for sub, info in discovered.items():
            info["mi_runs"].sort()
            info["missing_mi_runs"] = [r for r in self.ALL_MI_RUNS if r not in info["mi_runs"]]

        return dict(sorted(discovered.items()))

    def load_run_raw(self, subject_id: str, run: int, download_if_missing: bool = False) -> mne.io.Raw:
        """Load a single EDF recording for a subject and run.
        """
        norm_sub = normalize_subject_id(subject_id)
        file_path = self.find_edf_file(norm_sub, run)

        if file_path and file_path.exists():
            raw = mne.io.read_raw_edf(str(file_path), preload=True, verbose=False)
            return raw

        if download_if_missing:
            sub_int = get_subject_int(norm_sub)
            files = mne.datasets.eegbci.load_data(sub_int, [run], update_path=False, verbose=False)
            if files:
                raw = mne.io.read_raw_edf(files[0], preload=True, verbose=False)
                return raw

        raise FileNotFoundError(
            f"EDF file for subject {norm_sub}, run {run} not found in {self.data_dir} "
            f"and download_if_missing={download_if_missing}."
        )

    def extract_trials_from_raw(self, raw: mne.io.Raw, run: int) -> List[Tuple[np.ndarray, int]]:
        """Extract trials from an MNE Raw EDF instance using annotations.
        Returns a list of (raw_trial_data_64xT, class_label).
        """
        events, event_dict = mne.events_from_annotations(raw, verbose=False)
        sfreq = raw.info["sfreq"]

        # In PhysioNet EEGMMIDB annotations:
        # T0: Rest interval
        # T1: Task 1 onset
        # T2: Task 2 onset
        trials = []
        raw_data = raw.get_data()  # shape (channels, total_samples)

        # Mapping to 4 classes (0..3):
        # Runs 03, 07, 11 (execution) & 04, 08, 12 (imagery): T1 -> Left Fist (0), T2 -> Right Fist (1)
        # Runs 05, 09, 13 (execution) & 06, 10, 14 (imagery): T1 -> Both Fists (2), T2 -> Both Feet (3)
        # Baseline runs (R01, R02) and rest interval (T0) are discarded
        for ev in events:
            time_sample = ev[0]
            ev_id = ev[2]

            # Find matching annotation label
            ann_label = None
            for key, val in event_dict.items():
                if val == ev_id:
                    ann_label = key
                    break

            if not ann_label or ann_label == "T0":
                continue

            target_class = -1
            if run in self.ALL_TASK_FISTS:
                if ann_label == "T1":
                    target_class = 0
                elif ann_label == "T2":
                    target_class = 1
            elif run in self.ALL_TASK_FEET:
                if ann_label == "T1":
                    target_class = 2
                elif ann_label == "T2":
                    target_class = 3

            if target_class == -1:
                continue

            # In the trial timing: 4 seconds of MI execution
            # The cue is at time_sample. Extract 4.0s from onset:
            start_idx = time_sample
            end_idx = int(start_idx + 4.0 * sfreq)

            if end_idx <= raw_data.shape[1]:
                trial_data = raw_data[:, start_idx:end_idx]
                trials.append((trial_data, target_class))

        return trials

    def load_subject_trials(
        self,
        subject_id: str,
        runs: Optional[List[int]] = None,
        include_execution: bool = False,
        download_if_missing: bool = False,
        return_summary: bool = False,
    ) -> Union[List[Tuple[np.ndarray, int, List[str]]], Tuple[List[Tuple[np.ndarray, int, List[str]]], Dict[str, Any]]]:
        """Load available motor runs for a given subject.
        
        Args:
            subject_id: Subject identifier ('S001', 'Person-1', 1, etc.)
            runs: Optional explicit list of runs (e.g. [4, 6, 8, 10, 12, 14])
            include_execution: If True and runs is None, loads all 12 motor runs (R03-R14, ~180 trials).
                               If False and runs is None, loads 6 motor imagery runs (R04,06,08,10,12,14 per paper, ~90 trials).
            download_if_missing: Download missing runs via MNE if not found locally.
            return_summary: Return tuple of (trials, summary_dict)
        """
        norm_sub = normalize_subject_id(subject_id)
        subject_trials = []
        runs_found = []
        runs_missing = []
        runs_failed = []
        class_counts = {c: 0 for c in range(4)}

        target_runs = runs if runs is not None else (self.ALL_TASK_RUNS if include_execution else self.ALL_MI_RUNS)

        for run in target_runs:
            try:
                raw = self.load_run_raw(norm_sub, run, download_if_missing=download_if_missing)
                ch_names = raw.ch_names
                run_trials = self.extract_trials_from_raw(raw, run)
                for data, label in run_trials:
                    subject_trials.append((data, label, ch_names))
                    class_counts[label] += 1
                runs_found.append(run)
            except Exception as e:
                runs_missing.append(run)
                runs_failed.append((run, str(e)))

        summary = {
            "subject_id": norm_sub,
            "runs_found": runs_found,
            "runs_missing": runs_missing,
            "runs_failed": runs_failed,
            "trials_per_class": class_counts,
            "total_trials": len(subject_trials),
        }

        if len(subject_trials) == 0 and not download_if_missing:
            missing_str = ", ".join([f"R{r:02d}" for r in self.ALL_MI_RUNS])
            raise FileNotFoundError(
                f"No MI runs found for {norm_sub} (checked {missing_str})."
            )

        if return_summary:
            return subject_trials, summary
        return subject_trials

    @staticmethod
    def generate_synthetic_trial(
        target_class: int,
        fs: float = 160.0,
        duration_s: float = 4.0,
        ch_names: Optional[List[str]] = None,
        seed: Optional[int] = None,
    ) -> np.ndarray:
        """Generate a realistic synthetic 64-channel EEG trial with task-specific
        sensorimotor oscillations (Mu: 8-14 Hz, Beta: 14-30 Hz) reflecting
        contralateral and bilateral event-related desynchronization (ERD/ERS).
        
        Matches paper Section 3.1 & 3.2.
        """
        rng = np.random.RandomState(seed)
        if ch_names is None:
            ch_names = CLEAN_64_CHANNELS

        n_channels = len(ch_names)
        n_samples = int(duration_s * fs)
        t = np.linspace(0, duration_s, n_samples, endpoint=False)

        # Baseline 1/f pink noise + white noise
        white_noise = rng.normal(0, 5.0, size=(n_channels, n_samples))
        
        # Synthetic baseline mu (10 Hz) and beta (20 Hz) background rhythms
        mu_base = 15.0 * np.sin(2 * np.pi * 10.0 * t + rng.uniform(0, 2 * np.pi, size=(n_channels, 1)))
        beta_base = 8.0 * np.sin(2 * np.pi * 20.0 * t + rng.uniform(0, 2 * np.pi, size=(n_channels, 1)))
        eeg_signal = white_noise + mu_base + beta_base

        # Apply Task-Specific Motor Cortex Modulation
        # Class 0: Left fist -> Right hemisphere ERD (suppression around C4, FC4, CP4)
        # Class 1: Right fist -> Left hemisphere ERD (suppression around C3, FC3, CP3)
        # Class 2: Both fists -> Bilateral suppression in C3, C4, FC3, FC4, CP3, CP4
        # Class 3: Both feet -> Central suppression / foot area ERD (Cz, C1, C2)
        clean_ch = [c.replace(".", "").upper() for c in ch_names]
        
        def modulate_channels(channels: List[str], factor: float, high_beta_boost: float = 0.0):
            for ch in channels:
                for idx, c in enumerate(clean_ch):
                    if ch == c:
                        eeg_signal[idx] *= factor
                        if high_beta_boost > 0:
                            eeg_signal[idx] += high_beta_boost * np.sin(2 * np.pi * 22.0 * t)

        if target_class == 0:  # Left fist
            modulate_channels(["C4", "FC4", "CP4", "C6", "FC6"], factor=0.4, high_beta_boost=6.0)
            modulate_channels(["C3", "FC3", "CP3"], factor=1.2)
        elif target_class == 1:  # Right fist
            modulate_channels(["C3", "FC3", "CP3", "C5", "FC5"], factor=0.4, high_beta_boost=6.0)
            modulate_channels(["C4", "FC4", "CP4"], factor=1.2)
        elif target_class == 2:  # Both fists
            modulate_channels(["C3", "FC3", "CP3", "C4", "FC4", "CP4"], factor=0.35, high_beta_boost=8.0)
        elif target_class == 3:  # Both feet
            modulate_channels(["CZ", "C1", "C2", "FCZ", "CPZ"], factor=0.3, high_beta_boost=9.0)

        return eeg_signal.astype(np.float32)

    @classmethod
    def generate_synthetic_dataset(
        cls,
        subjects: List[str],
        trials_per_task: int = 21,
        fs: float = 160.0,
        duration_s: float = 4.0,
        seed: int = 42,
    ) -> Dict[str, List[Tuple[np.ndarray, int, List[str]]]]:
        """Generate a complete synthetic EEGMMIDB dataset for subjects (S1..S10 or custom).
        Each subject gets 21 trials * 4 tasks = 84 trials, matching Section 3.1.
        """
        rng = np.random.RandomState(seed)
        dataset = {}
        for s_idx, sub in enumerate(subjects):
            norm_sub = normalize_subject_id(sub)
            subject_trials = []
            for task in range(4):
                for trial_idx in range(trials_per_task):
                    sub_seed = rng.randint(0, 1000000)
                    data = cls.generate_synthetic_trial(
                        target_class=task,
                        fs=fs,
                        duration_s=duration_s,
                        ch_names=CLEAN_64_CHANNELS,
                        seed=sub_seed,
                    )
                    subject_trials.append((data, task, list(CLEAN_64_CHANNELS)))
            # Shuffle trials deterministically
            rng.shuffle(subject_trials)
            dataset[norm_sub] = subject_trials

        return dataset
