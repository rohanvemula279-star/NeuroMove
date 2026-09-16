"""Model 1: MiniRocket + Ridge Classifier Pipeline.
Paper Reference: Hwaidi & Ghanem (NeuroImage 328, 2026), Section 3.3.
MiniRocket Reference: Dempster et al., "MINIROCKET: A Very Fast (Almost) Deterministic
Transform for Time Series Classification" (ACM SIGKDD 2021).

Key Paper Findings:
  - Deterministic proportion-of-positive-values (PPV) features pooled from dilated convolutions.
  - Default K = 10,000 random kernels.
  - In default configuration, 32 dilations are allowed per kernel; however, the authors found
    that the best results came from using a maximum of 28 dilations per kernel.
  - RidgeClassifier with closed-form solver and cross-validated alpha selection (RidgeClassifierCV).
  - Also provides MiniRocketPerPairClassifier for modular decision-level fusion across electrode pairs.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
from sklearn.linear_model import RidgeClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import joblib


class MiniRocketTransform:
    """Vectorized, standalone MiniRocket transform adhering to Dempster et al. (2021).
    Computes Proportion of Positive Values (PPV) features across dilated convolutions
    using 84 canonical length-9 kernel patterns with weights in {-1, 2}.
    """

    def __init__(
        self,
        num_kernels: int = 10000,
        max_dilations: int = 28,
        random_state: int = 42,
    ):
        self.num_kernels = num_kernels
        self.max_dilations = max_dilations
        self.random_state = random_state

        # Fitted parameters
        self.dilations: Optional[np.ndarray] = None
        self.kernel_indices: Optional[np.ndarray] = None
        self.biases: Optional[np.ndarray] = None
        self.kernel_patterns: Optional[np.ndarray] = None
        self.is_fitted: bool = False

    @staticmethod
    def _generate_84_patterns() -> np.ndarray:
        """Generate the 84 fixed combinations of length 9 with 2 two-values and 7 minus-one values.
        Weights: sum is 2*2 + 7*(-1) = 4 - 7 = -3 (mean centered to approximately 0).
        """
        patterns = []
        # Combinations of 2 positions out of 9 set to +2, rest -1
        for i in range(9):
            for j in range(i + 1, 9):
                pat = np.full(9, -1.0, dtype=np.float32)
                pat[i] = 2.0
                pat[j] = 2.0
                patterns.append(pat)
        return np.array(patterns, dtype=np.float32)  # (84, 9)

    def fit(self, X: np.ndarray, y: Optional[np.ndarray] = None) -> "MiniRocketTransform":
        """Fit MiniRocket parameters (dilations and quantile-derived biases) from training series.
        
        Args:
            X: Array of shape (n_samples, sequence_length) or (n_samples, 1, sequence_length)
        """
        if X.ndim == 3:
            X = X.squeeze(axis=1)

        n_samples, seq_len = X.shape
        rng = np.random.RandomState(self.random_state)

        # 1. Available canonical length-9 patterns
        self.kernel_patterns = self._generate_84_patterns()
        n_patterns = len(self.kernel_patterns)

        # 2. Compute valid dilations up to min(max_dilations, max_possible)
        # Receptive field = 1 + dilation * (9 - 1) = 1 + 8 * dilation <= seq_len
        max_possible_dilation = max(1, (seq_len - 1) // 8)
        effective_max_dilation = min(self.max_dilations, max_possible_dilation)

        # Geometric / exponential distribution of dilations: 2 ** exponent
        max_exponent = int(np.floor(np.log2(effective_max_dilation))) if effective_max_dilation > 1 else 0
        dilations_list = [2 ** exp for exp in range(max_exponent + 1)]
        if effective_max_dilation not in dilations_list and effective_max_dilation > 0:
            dilations_list.append(effective_max_dilation)
        dilations_arr = np.array(sorted(dilations_list), dtype=np.int32)

        # 3. Assign dilations and kernels
        # Distribute kernels across dilations
        n_dilations = len(dilations_arr)
        kernels_per_dilation = int(np.ceil(self.num_kernels / n_dilations))
        actual_num_kernels = kernels_per_dilation * n_dilations

        assigned_dilations = []
        assigned_kernel_idx = []
        for d in dilations_arr:
            # Repeat pattern indices
            k_idx = rng.choice(n_patterns, size=kernels_per_dilation, replace=True)
            assigned_dilations.extend([d] * kernels_per_dilation)
            assigned_kernel_idx.extend(k_idx)

        self.dilations = np.array(assigned_dilations[: self.num_kernels], dtype=np.int32)
        self.kernel_indices = np.array(assigned_kernel_idx[: self.num_kernels], dtype=np.int32)

        # 4. Compute biases from quantiles of convolution outputs on a sample subset
        sample_subset_size = min(n_samples, 32)
        sample_idx = rng.choice(n_samples, size=sample_subset_size, replace=False)
        X_sub = X[sample_idx]

        biases = np.zeros(self.num_kernels, dtype=np.float32)
        for k in range(self.num_kernels):
            dilation = self.dilations[k]
            pattern = self.kernel_patterns[self.kernel_indices[k]]

            # Perform 1D dilated convolution on a randomly chosen sample from subset
            sub_sample = X_sub[rng.randint(0, sample_subset_size)]
            conv_out = self._convolve_1d_dilated(sub_sample, pattern, dilation)
            if len(conv_out) > 0:
                # Quantile between 0.1 and 0.9 as bias scalar
                q = rng.uniform(0.1, 0.9)
                biases[k] = -float(np.quantile(conv_out, q))
            else:
                biases[k] = 0.0

        self.biases = biases
        self.is_fitted = True
        return self

    @staticmethod
    def _convolve_1d_dilated(signal: np.ndarray, kernel: np.ndarray, dilation: int) -> np.ndarray:
        """Dilated 1D valid convolution without padding."""
        k_len = len(kernel)
        receptive_field = 1 + (k_len - 1) * dilation
        sig_len = len(signal)
        if sig_len < receptive_field:
            return np.array([0.0], dtype=np.float32)

        out_len = sig_len - receptive_field + 1
        # Strided indexing for fast convolution
        strides = signal.strides[0]
        from numpy.lib.stride_tricks import as_strided
        shape = (out_len, k_len)
        strides_2d = (strides, strides * dilation)
        windows = as_strided(signal, shape=shape, strides=strides_2d)
        return windows @ kernel

    def transform(self, X: np.ndarray) -> np.ndarray:
        """Transform time series batch to PPV feature matrix of shape (n_samples, num_kernels).
        Vectorized across samples and kernels using strided tensor operations.
        
        PPV = (1 / m) * sum(conv_out + bias > 0)
        """
        if not self.is_fitted:
            raise RuntimeError("MiniRocketTransform must be fitted before calling transform.")

        if X.ndim == 3:
            X = X.squeeze(axis=1)

        n_samples, seq_len = X.shape
        features = np.zeros((n_samples, self.num_kernels), dtype=np.float32)

        from numpy.lib.stride_tricks import as_strided

        sample_batch_size = 128
        unique_dilations = np.unique(self.dilations)

        for start_idx in range(0, n_samples, sample_batch_size):
            end_idx = min(start_idx + sample_batch_size, n_samples)
            X_batch = X[start_idx:end_idx]
            b_size = len(X_batch)

            for d in unique_dilations:
                k_mask = (self.dilations == d)
                k_idxs = np.where(k_mask)[0]
                if len(k_idxs) == 0:
                    continue

                k_len = 9
                receptive_field = 1 + (k_len - 1) * d
                if seq_len < receptive_field:
                    continue

                out_len = seq_len - receptive_field + 1
                s_sample, s_time = X_batch.strides[0], X_batch.strides[1]
                shape_3d = (b_size, out_len, k_len)
                strides_3d = (s_sample, s_time, s_time * d)
                w3d = as_strided(X_batch, shape=shape_3d, strides=strides_3d)
                w2d = w3d.reshape(-1, k_len)

                # Process kernels in chunks of 500 for optimal memory and cache reuse
                for k_chunk in range(0, len(k_idxs), 500):
                    cur_k_idxs = k_idxs[k_chunk : k_chunk + 500]
                    weights = self.kernel_patterns[self.kernel_indices[cur_k_idxs]].T
                    conv = (w2d @ weights).reshape(b_size, out_len, -1)
                    biases_chunk = self.biases[cur_k_idxs].reshape(1, 1, -1)
                    ppv = np.mean((conv + biases_chunk) > 0.0, axis=1)
                    features[start_idx:end_idx, cur_k_idxs] = ppv

        return features

    def fit_transform(self, X: np.ndarray, y: Optional[np.ndarray] = None) -> np.ndarray:
        return self.fit(X, y).transform(X)


class MiniRocketPipeline:
    """End-to-end MiniRocket + RidgeClassifierCV pipeline for 4-class Motor Imagery EEG.
    Provides polymorphic interface: fit, predict, predict_proba, evaluate, save, load.

    Supports both:
      1. Multi-pair spatial feature fusion across 5 symmetric motor cortex pairs
         (FC3-FC4, C5-C6, C3-C4, C1-C2, CP3-CP4) with 2,000 kernels/pair (10,000 kernels total).
         Auto-detected for input length 2560 or shape (N, 5, 512).
      2. Single-pair time series (512 or 1024 samples) with 10,000 kernels.
    
    Paper Reference: Section 3.3 & Section 4.
    """

    def __init__(
        self,
        num_kernels: int = 10000,
        kernels_per_pair: int = 2000,
        max_dilations: int = 28,
        alphas: Optional[np.ndarray] = None,
        random_state: int = 42,
        is_spatial_fusion: Optional[bool] = None,
    ):
        self.num_kernels = num_kernels
        self.kernels_per_pair = kernels_per_pair
        self.max_dilations = max_dilations
        self.random_state = random_state
        self.alphas = alphas if alphas is not None else np.logspace(-1, 5, 10)
        self.is_spatial_fusion = is_spatial_fusion

        # Single-sequence transformer
        self.transformer = MiniRocketTransform(
            num_kernels=self.num_kernels,
            max_dilations=self.max_dilations,
            random_state=self.random_state,
        )
        # 5-pair spatial fusion transformers
        self.transformers: List[MiniRocketTransform] = []
        self.scaler = StandardScaler()
        self.classifier = RidgeClassifierCV(alphas=self.alphas)
        self.classes_: Optional[np.ndarray] = None
        self.is_trained: bool = False

    def _prepare_input(self, X: np.ndarray) -> Tuple[np.ndarray, bool]:
        """Determine if input is 5-pair spatial fusion or single-sequence."""
        if X.ndim == 1:
            X = X.reshape(1, -1)

        if self.is_spatial_fusion is True:
            use_fusion = True
        elif self.is_spatial_fusion is False:
            use_fusion = False
        else:
            # Auto-detect
            if X.ndim == 3 and X.shape[1] == 5 and X.shape[2] == 512:
                use_fusion = True
            elif X.ndim == 2 and X.shape[1] == 2560:
                use_fusion = True
            else:
                use_fusion = False

        if use_fusion:
            if X.ndim == 2 and X.shape[1] == 2560:
                X = X.reshape(-1, 5, 512)
            elif X.ndim == 2 and X.shape[1] != 2560:
                raise ValueError(f"Expected 2560 samples for 5-pair spatial fusion, got {X.shape[1]}")
        return X, use_fusion

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> "MiniRocketPipeline":
        """Fit MiniRocket feature transform and train RidgeClassifierCV on training data.
        
        Args:
            X: Array of shape (n_samples, 2560) or (n_samples, 5, 512) for 5-pair fusion,
               or (n_samples, seq_len) for single sequence.
            y: Integer labels 0..3
        """
        X_prep, use_fusion = self._prepare_input(X)
        self.is_spatial_fusion = use_fusion

        if use_fusion:
            # 5-pair feature-level spatial fusion
            self.transformers = [
                MiniRocketTransform(
                    num_kernels=self.kernels_per_pair,
                    max_dilations=self.max_dilations,
                    random_state=self.random_state + p_idx * 10,
                )
                for p_idx in range(5)
            ]
            pair_feats = []
            for p_idx in range(5):
                X_p = X_prep[:, p_idx, :]  # (N, 512)
                pair_feats.append(self.transformers[p_idx].fit_transform(X_p))
            X_feats = np.concatenate(pair_feats, axis=1)  # (N, 10000)
        else:
            X_feats = self.transformer.fit_transform(X_prep)

        # 2. Scale features
        X_scaled = self.scaler.fit_transform(X_feats)

        # Use Generalized Cross-Validation (cv=None) for analytic closed-form SVD solve
        self.classifier = RidgeClassifierCV(alphas=self.alphas, cv=None)
        self.classifier.fit(X_scaled, y)
        self.classes_ = np.unique(y)
        self.is_trained = True

        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        """Transform raw EEG windows to scaled MiniRocket PPV feature space."""
        if not self.is_trained:
            raise RuntimeError("Pipeline is not trained.")
        X_prep, use_fusion = self._prepare_input(X)
        if use_fusion:
            pair_feats = []
            for p_idx in range(5):
                X_p = X_prep[:, p_idx, :]
                pair_feats.append(self.transformers[p_idx].transform(X_p))
            X_feats = np.concatenate(pair_feats, axis=1)
        else:
            X_feats = self.transformer.transform(X_prep)
        return self.scaler.transform(X_feats)

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class labels (0, 1, 2, 3) for input samples."""
        if not self.is_trained:
            raise RuntimeError("Model is not trained yet.")
        X_scaled = self.transform(X)
        preds = self.classifier.predict(X_scaled)
        return preds.astype(np.int64)

    def predict_proba(self, X: np.ndarray, temperature: float = 0.35) -> np.ndarray:
        """Compute calibrated class probability distribution using Softmax over Ridge decision values.
        """
        if not self.is_trained:
            raise RuntimeError("Model is not trained yet.")
        X_scaled = self.transform(X)
        decision_scores = self.classifier.decision_function(X_scaled)

        # If binary classification, decision_scores is 1D; for 4-class it is (n_samples, 4)
        if decision_scores.ndim == 1:
            decision_scores = np.column_stack([-decision_scores, decision_scores])

        # Softmax with numerical stability
        scaled_scores = decision_scores / max(1e-5, temperature)
        exp_scores = np.exp(scaled_scores - np.max(scaled_scores, axis=1, keepdims=True))
        probabilities = exp_scores / np.sum(exp_scores, axis=1, keepdims=True)

        return probabilities.astype(np.float32)

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Union[float, np.ndarray]]:
        """Evaluate performance metrics on test/validation set.
        """
        y_pred = self.predict(X)
        acc = float(accuracy_score(y, y_pred))
        precision, recall, f1, _ = precision_recall_fscore_support(
            y, y_pred, average="macro", zero_division=0
        )
        return {
            "accuracy": acc,
            "macro_precision": float(precision),
            "macro_recall": float(recall),
            "macro_f1": float(f1),
            "y_pred": y_pred,
        }

    def count_parameters(self) -> int:
        """Return number of trainable parameters (approx 40,000 for K=10,000 x 4 classes).
        Paper Reference: Table 2 (Trainable params: 40,000).
        """
        if hasattr(self.classifier, "coef_"):
            return int(self.classifier.coef_.size + self.classifier.intercept_.size)
        return self.num_kernels * 4

    def save(self, filepath: Union[str, Path]) -> None:
        """Persist model pipeline to disk."""
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "num_kernels": self.num_kernels,
                "kernels_per_pair": self.kernels_per_pair,
                "max_dilations": self.max_dilations,
                "is_spatial_fusion": self.is_spatial_fusion,
                "transformer": self.transformer,
                "transformers": self.transformers,
                "scaler": self.scaler,
                "classifier": self.classifier,
                "classes_": self.classes_,
                "is_trained": self.is_trained,
            },
            path,
        )

    def load(self, filepath: Optional[Union[str, Path]] = None) -> "MiniRocketPipeline":
        """Load persisted model pipeline from disk. Supports both instance and class calls."""
        if isinstance(self, type):
            instance = self()
            return instance.load(filepath)
        if filepath is None and isinstance(self, (str, Path)):
            instance = MiniRocketPipeline()
            return instance.load(self)
        if filepath is None:
            raise ValueError("filepath must be provided.")

        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")

        data = joblib.load(path)
        self.num_kernels = data.get("num_kernels", 10000)
        self.kernels_per_pair = data.get("kernels_per_pair", 2000)
        self.max_dilations = data.get("max_dilations", 28)
        self.is_spatial_fusion = data.get("is_spatial_fusion", False)
        self.transformer = data.get("transformer", None)
        self.transformers = data.get("transformers", [])
        self.scaler = data["scaler"]
        self.classifier = data["classifier"]
        self.classes_ = data["classes_"]
        self.is_trained = data["is_trained"]
        return self


class MiniRocketSpatialFusionPipeline(MiniRocketPipeline):
    """MiniRocket with feature-level spatial fusion across 5 symmetric motor cortex pairs.
    Validated in Prompt J ablation study to achieve 46.20% average accuracy (converging with CSP+LDA).
    """

    def __init__(
        self,
        num_kernels: int = 10000,
        kernels_per_pair: int = 2000,
        max_dilations: int = 28,
        alphas: Optional[np.ndarray] = None,
        random_state: int = 42,
    ):
        super().__init__(
            num_kernels=num_kernels,
            kernels_per_pair=kernels_per_pair,
            max_dilations=max_dilations,
            alphas=alphas,
            random_state=random_state,
            is_spatial_fusion=True,
        )


class MiniRocketPerPairClassifier:
    """Trains an independent MiniRocket + Ridge model per symmetrical electrode pair.
    Exposes per-pair prediction scores and probabilities for downstream decision-level
    or Choquet-integral fusion.
    
    Paper Reference: Section 5.3:
      "Because we use five symmetric electrode pairs... A practical design is decision-level
       fusion: (i) train a MiniRocket+ridge classifier per electrode pair to output class
       scores/probabilities; (ii) fuse the per-pair scores..."
    """

    def __init__(
        self,
        num_kernels: int = 2000,
        max_dilations: int = 28,
        random_state: int = 42,
    ):
        self.num_kernels = num_kernels
        self.max_dilations = max_dilations
        self.random_state = random_state
        self.pair_models: Dict[str, MiniRocketPipeline] = {}
        self.is_trained: bool = False

    def fit(
        self,
        pair_data: Dict[str, np.ndarray],
        y: np.ndarray,
    ) -> "MiniRocketPerPairClassifier":
        """Fit one model per electrode pair.
        
        Args:
            pair_data: Dict mapping pair name (e.g. 'C3-C4') to array of shape (n_samples, seq_len)
            y: Array of labels (n_samples,)
        """
        for idx, (pair_name, X_pair) in enumerate(pair_data.items()):
            model = MiniRocketPipeline(
                num_kernels=self.num_kernels,
                max_dilations=self.max_dilations,
                random_state=self.random_state + idx * 7,
            )
            model.fit(X_pair, y)
            self.pair_models[pair_name] = model

        self.is_trained = True
        return self

    def predict_per_pair(self, pair_data: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """Return class predictions from each electrode pair model."""
        if not self.is_trained:
            raise RuntimeError("Per-pair classifier is not trained.")
        return {
            pair_name: self.pair_models[pair_name].predict(X_pair)
            for pair_name, X_pair in pair_data.items()
            if pair_name in self.pair_models
        }

    def predict_proba_per_pair(self, pair_data: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """Return probability distributions from each electrode pair model."""
        if not self.is_trained:
            raise RuntimeError("Per-pair classifier is not trained.")
        return {
            pair_name: self.pair_models[pair_name].predict_proba(X_pair)
            for pair_name, X_pair in pair_data.items()
            if pair_name in self.pair_models
        }

    def predict_ensemble(self, pair_data: Dict[str, np.ndarray]) -> Tuple[np.ndarray, np.ndarray]:
        """Ensemble decision-level probabilities across all electrode pairs via soft voting.
        Returns:
            (predicted_classes, mean_probabilities)
        """
        prob_dict = self.predict_proba_per_pair(pair_data)
        all_probs = list(prob_dict.values())
        mean_prob = np.mean(all_probs, axis=0)
        preds = np.argmax(mean_prob, axis=1)
        return preds, mean_prob

    def save(self, filepath: Union[str, Path]) -> None:
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "num_kernels": self.num_kernels,
                "max_dilations": self.max_dilations,
                "pair_models": self.pair_models,
                "is_trained": self.is_trained,
            },
            path,
        )

    def load(self, filepath: Union[str, Path]) -> "MiniRocketPerPairClassifier":
        path = Path(filepath)
        data = joblib.load(path)
        self.num_kernels = data["num_kernels"]
        self.max_dilations = data["max_dilations"]
        self.pair_models = data["pair_models"]
        self.is_trained = data["is_trained"]
        return self
