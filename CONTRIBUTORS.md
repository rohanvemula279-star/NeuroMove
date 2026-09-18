# Project Contributors & Research Team

This document recognizes the core research team and contributors behind **NeuroMove 2.0: Dual-Champion Motor Imagery EEG Neural Decoding System**. Each member has driven crucial subsystems of the neurophysiological pipeline, machine learning architectures, high-throughput backend services, and clinical-grade telemetry interfaces.

---

## 👥 Core Contributors

| Contributor | Role & Domain | Primary Repository Modules | GitHub Profile |
| :--- | :--- | :--- | :--- |
| **Rohan Vemula** | Project Lead & System Architect | Core system design, zero-leakage cross-validation, integration | [@rohanvemula279-star](https://github.com/rohanvemula279-star) |
| **Sudhasri A** | Machine Learning Engineer | MiniRocket spatial fusion, kernel transforms, Ridge optimization | [@SudhasriA](https://github.com/SudhasriA) |
| **Nakshathra V** | Deep Learning Architect | Hybrid CNN-LSTM spatio-temporal neural network, dynamic scheduler | [@nakshathrav2007-hash](https://github.com/nakshathrav2007-hash) |
| **Akshitha Reddy** | Biomedical Signal Specialist | EEG preprocessing, 4th-order Butterworth filters, CAR, EDF loader | [@akshithareddy025-jpg](https://github.com/akshithareddy025-jpg) |
| **Sahasra Marikanti** | Full-Stack BCI Systems Lead | FastAPI WebSocket streaming, Sentinel React UI, live oscilloscope | [@sahasramarikanti-cpu](https://github.com/sahasramarikanti-cpu) |

---

## 🔬 Detailed Code & Research Contributions

### 1. Sudhasri A ([@SudhasriA](https://github.com/SudhasriA))
* **MiniRocket Spatial Fusion Pipeline (`app/models/minirocket_pipeline.py`)**:
  * Designed and implemented the multi-pair convolutional kernel transformation generating 10,000 Proportion of Positive Values (PPV) features across 5 symmetric motor cortex pairs (`FC3-FC4`, `C5-C6`, `C3-C4`, `C1-C2`, `CP3-CP4`).
  * Optimized feature extraction vectors to achieve sub-10ms (7.06 ms) inference latency per window.
* **Closed-Form Classifier Optimization (`app/models/minirocket_pipeline.py`, `scripts/train_v2.py`)**:
  * Configured `RidgeClassifierCV` with L2 regularization and closed-form SVD solver, achieving the champion **97.41% test accuracy** and **0.9740 Macro F1** across all 5 PhysioNet subjects.
* **Ablation Benchmarking & Verification (`scripts/run_ablation.py`, `tests/test_minirocket.py`)**:
  * Authored experimental ablation suites proving the empirical leap from single-channel pairs (39.12%) to 5-pair spatial fusion (97.41%).

---

### 2. Nakshathra V ([@nakshathrav2007-hash](https://github.com/nakshathrav2007-hash))
* **Hybrid CNN-LSTM Architecture (`app/models/cnn_lstm.py`)**:
  * Architected the deep spatio-temporal neural network combining multi-scale 1D temporal convolutions (`Conv1D(32, k=7) -> Conv1D(64, k=5) -> Conv1D(128, k=3)`) with a 128-unit Bidirectional LSTM.
  * Formulated spatio-temporal feature extraction directly from raw $(N, 256, 10)$ normalized electrode tensors.
* **Optimization & Regularization Strategies (`scripts/train_high_accuracy.py`)**:
  * Integrated dynamic `ReduceLROnPlateau` scheduling, spatial dropout layers, and Adam optimization with weight decay, reaching **97.16% test accuracy** and **0.9978 ROC-AUC**.
* **Gradient Stability & Tensor Verification (`tests/test_cnn_lstm.py`)**:
  * Authored unit tests validating tensor dimensions, softmax probability calibrations, and zero NaN/inf gradient flows during model evaluation.

---

### 3. Akshitha Reddy ([@akshithareddy025-jpg](https://github.com/akshithareddy025-jpg))
* **Digital Signal Processing Engine (`app/data/preprocessing.py`)**:
  * Designed and tuned the zero-phase 4th-order Butterworth bandpass filter (8–30 Hz $\mu$ and $\beta$ rhythm isolation) using second-order sections (`scipy.signal.sosfiltfilt`).
  * Implemented Common Average Referencing (CAR) across the 64-channel PhysioNet montage to eliminate non-cerebral common noise.
  * Implemented anti-aliasing downsampling filters converting 160 Hz raw acquisition data down to 128 Hz.
* **Multi-Format Ingestion & Dataset Handling (`app/data/loader.py`)**:
  * Built robust loaders parsing `.edf`, `.npy`, `.npz`, and `.csv` EEG recordings with trial segmentation and zero boundary leakage.
* **DSP Verification Suite (`tests/test_preprocessing.py`)**:
  * Developed mathematical tests confirming strictly $0.0^\circ$ phase distortion and exact frequency roll-off characteristics.

---

### 4. Sahasra Marikanti ([@sahasramarikanti-cpu](https://github.com/sahasramarikanti-cpu))
* **Real-Time Streaming Engine & Telemetry (`app/routers/stream.py`, `app/services/streaming.py`)**:
  * Built the FastAPI 2.0 WebSocket streaming server broadcasting 9-window sequential trial playback with low-latency client synchronization.
  * Implemented trial ingestion and inference routing (`app/routers/upload.py`, `app/routers/predict.py`).
* **Sentinel Scientific UI & Real-Time Oscilloscope (`frontend/src/`)**:
  * Designed and built the live dual-waveform oscilloscope ([`SignalExplainer.jsx`](file:///frontend/src/components/SignalExplainer.jsx), [`LivePlaybackView.jsx`](file:///frontend/src/components/LivePlaybackView.jsx)), visualizing raw noisy EEG versus isolated 8–30 Hz sensorimotor waveforms in real time.
  * Implemented live motor class probability meters and playback speed controls.
* **Benchmark Analytics & Heatmaps (`frontend/src/components/ConfusionMatrix.jsx`, `RocChart.jsx`)**:
  * Created interactive, color-coded 4-class confusion matrix heatmaps and multi-threshold ROC-AUC curve visualizers.

---

### 5. Rohan Vemula ([@rohanvemula279-star](https://github.com/rohanvemula279-star))
* **System Architecture & Coordination**:
  * Formulated the end-to-end NeuroMove 2.0 dual-champion system architecture and PhysioNet EEGMMIDB 5-subject benchmark protocol.
* **Zero-Leakage Cross-Validation Framework (`scripts/train_v2.py`)**:
  * Engineered strict continuous trial grouping ensuring complete isolation between train and validation splits.
* **Automated Verification & Release**:
  * Designed the full 29-test automated pytest verification suite and project documentation.

---

## 📜 Academic Integrity & Collaboration

All contributors participated in the research, architectural design, model experimentation, and code verification for NeuroMove 2.0 under the MIT open-source license.
