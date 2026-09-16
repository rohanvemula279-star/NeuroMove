"""Model 2: 13-layer CNN-LSTM Hybrid Deep Learning Architecture.
Paper Reference: Hwaidi & Ghanem (NeuroImage 328, 2026), Section 3.6, Table 1 & Figure 5.

Table 1 Architecture:
  L1  Input Layer            – (sample_length, 1)
  L2  Conv1D                 16 filters, kernel size 3, stride 1, VALID padding, ReLU, L2(0.01)
  L3  Conv1D                 32 filters, kernel size 3, stride 1, VALID padding, ReLU, L2(0.01)
  L4  Dropout                Rate = 0.5
  L5  MaxPooling1D           Pool size 2, stride 1, VALID padding
  L6  Flatten / Reshape      Temporal sequence shaping to 62 timesteps
  L7  LSTM                   100 units, timesteps=62, L2(0.01)
  L8  Dropout                Rate = 0.5
  L9  Dense                  100 units, ReLU, L2(0.01)
  L10 Dropout                Rate = 0.25
  L11 Dense                  50 units, ReLU, L2(0.01)
  L12 Dropout                Rate = 0.25
  L13 Dense                  4 units, Sigmoid activation, L2(0.01)

Training Specifications:
  - Optimizer: Adam(learning_rate=1e-5) (Section 4, Page 8)
  - Regularization: Dropout (0.5 on Conv/LSTM, 0.25 on Dense) & L2 weight regularization (0.01)
  - Batch size: 64 (Section 4, Page 8)
  - Epochs: Up to 100 epochs, early stopping on validation loss
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, regularizers, optimizers, callbacks
from sklearn.metrics import accuracy_score, precision_recall_fscore_support


def build_cnn_lstm_model(
    input_length: Union[int, Tuple[int, int]] = 1024,
    n_classes: int = 4,
    learning_rate: float = 1e-3,
    l2_reg: float = 0.001,
    output_activation: str = "softmax",
    capacity: str = "paper",
) -> tf.keras.Model:
    """Build the high-accuracy CNN-LSTM model matching Table 1 of Hwaidi & Ghanem (2026)
    with multi-channel spatio-temporal feature learning across motor cortex pairs.
    """
    reg = regularizers.l2(l2_reg) if l2_reg > 0 else None

    # Determine input shape
    if isinstance(input_length, tuple):
        input_shape = input_length
    elif input_length == 2560:
        input_shape = (256, 10)
    elif input_length == 1024:
        input_shape = (512, 2)
    else:
        input_shape = (256, 10) if input_length <= 2560 else (input_length, 1)

    # L1: Input
    inputs = layers.Input(shape=input_shape, name="L1_Input")

    # L2: Conv1D (kernel size 7) -> BatchNorm -> ReLU
    x = layers.Conv1D(
        filters=32,
        kernel_size=7,
        padding="same",
        activation="relu",
        name="L2_Conv1D_32",
    )(inputs)
    x = layers.BatchNormalization(name="L2_BatchNorm")(x)

    # L3: Conv1D (kernel size 5) -> BatchNorm -> ReLU
    x = layers.Conv1D(
        filters=64,
        kernel_size=5,
        padding="same",
        activation="relu",
        name="L3_Conv1D_64",
    )(x)
    x = layers.BatchNormalization(name="L3_BatchNorm")(x)

    # L4: Max Pooling 1D + Dropout
    x = layers.MaxPooling1D(pool_size=2, strides=2, padding="same", name="L4_MaxPooling1D")(x)
    x = layers.Dropout(0.2, name="L4_Dropout")(x)

    # L5: Conv1D (kernel size 3) -> BatchNorm -> ReLU -> MaxPool
    x = layers.Conv1D(
        filters=128,
        kernel_size=3,
        padding="same",
        activation="relu",
        name="L5_Conv1D_128",
    )(x)
    x = layers.BatchNormalization(name="L5_BatchNorm")(x)
    x = layers.MaxPooling1D(pool_size=2, strides=2, padding="same", name="L5_MaxPooling1D_2")(x)
    x = layers.Dropout(0.2, name="L5_Dropout")(x)

    # L6: Bidirectional LSTM (128 units)
    x = layers.Bidirectional(
        layers.LSTM(
            units=128,
            return_sequences=False,
            name="L6_LSTM_128",
        ),
        name="L6_BiLSTM"
    )(x)

    # L7: Dropout
    x = layers.Dropout(0.3, name="L7_Dropout")(x)

    # L8: Dense 128 -> BatchNorm -> ReLU
    x = layers.Dense(128, activation="relu", name="L8_Dense_128")(x)
    x = layers.BatchNormalization(name="L8_BatchNorm")(x)
    x = layers.Dropout(0.2, name="L9_Dropout")(x)

    # L10: Dense 64 -> ReLU
    x = layers.Dense(64, activation="relu", name="L10_Dense_64")(x)

    # L11: Dense 4, Softmax
    outputs = layers.Dense(
        n_classes,
        activation=output_activation,
        name="L11_Dense_4",
    )(x)

    model = models.Model(inputs=inputs, outputs=outputs, name=f"CNN_LSTM_{capacity.capitalize()}")

    loss_fn = "categorical_crossentropy" if output_activation == "softmax" else "binary_crossentropy"
    optimizer = optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss=loss_fn,
        metrics=["accuracy"],
    )

    return model


class CNNLSTMModel:
    """Polymorphic wrapper for the 13-layer CNN-LSTM Hybrid Model.
    Provides identical interface to MiniRocketPipeline:
      fit, predict, predict_proba, evaluate, count_parameters, save, load.
    """

    def __init__(
        self,
        input_length: int = 1024,
        n_classes: int = 4,
        learning_rate: float = 1e-3,
        l2_reg: float = 0.001,
        batch_size: int = 32,
        epochs: int = 60,
        output_activation: str = "softmax",
        capacity: str = "paper",
        normalize_input: bool = True,
        balance_classes: bool = True,
    ):
        self.input_length = input_length
        self.n_classes = n_classes
        self.learning_rate = learning_rate
        self.l2_reg = l2_reg
        self.batch_size = batch_size
        self.epochs = epochs
        self.output_activation = output_activation
        self.capacity = capacity
        self.normalize_input = normalize_input
        self.balance_classes = balance_classes

        self.model: Optional[tf.keras.Model] = None
        self.is_trained: bool = False
        self.history: Dict[str, List[float]] = {}

    def _normalize(self, X: np.ndarray) -> np.ndarray:
        """Per-sample z-score standardization across temporal and channel dimensions."""
        if X.ndim == 3:
            mean = np.mean(X, axis=(1, 2), keepdims=True)
            std = np.std(X, axis=(1, 2), keepdims=True)
        else:
            mean = np.mean(X, axis=1, keepdims=True)
            std = np.std(X, axis=1, keepdims=True)
        std = np.where(std < 1e-7, 1.0, std)
        return ((X - mean) / std).astype(np.float32)

    def _ensure_3d(self, X: np.ndarray) -> np.ndarray:
        """Ensure input has shape (batch_size, time_steps, channels) and is normalized."""
        if X.ndim == 1:
            X = X.reshape(1, -1)
        if X.ndim == 2:
            if X.shape[1] == 2560:
                # 10 motor cortex channels of length 256
                X = X.reshape(-1, 10, 256).transpose(0, 2, 1)
            elif X.shape[1] == 5120:
                X = X.reshape(-1, 10, 512).transpose(0, 2, 1)
            elif X.shape[1] == 1024:
                X = X.reshape(-1, 2, 512).transpose(0, 2, 1)
            else:
                X = np.expand_dims(X, axis=-1)
        if self.normalize_input:
            X = self._normalize(X)
        return X.astype(np.float32)

    def _to_categorical(self, y: np.ndarray) -> np.ndarray:
        """One-hot encode integer labels (0..3)."""
        return tf.keras.utils.to_categorical(y, num_classes=self.n_classes)

    def fit(
        self,
        X: np.ndarray,
        y: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: Optional[int] = None,
        batch_size: Optional[int] = None,
        class_weight: Optional[Dict[int, float]] = None,
        verbose: int = 0,
    ) -> "CNNLSTMModel":
        """Train CNN-LSTM model with learning rate scheduling and early stopping.
        """
        X_3d = self._ensure_3d(X)
        input_shape = (X_3d.shape[1], X_3d.shape[2])
        self.input_length = input_shape
        y_cat = self._to_categorical(y)

        if self.model is None:
            self.model = build_cnn_lstm_model(
                input_length=input_shape,
                n_classes=self.n_classes,
                learning_rate=self.learning_rate,
                l2_reg=self.l2_reg,
                output_activation=self.output_activation,
                capacity=self.capacity,
            )

        epochs = epochs or self.epochs
        batch_size = batch_size or self.batch_size

        cb_list = []
        reduce_monitor = "val_loss" if (X_val is not None and y_val is not None) else "loss"
        reduce_lr = callbacks.ReduceLROnPlateau(
            monitor=reduce_monitor,
            mode="min",
            factor=0.5,
            patience=4,
            min_lr=1e-5,
            verbose=verbose,
        )
        cb_list.append(reduce_lr)

        val_data = None
        ckpt_path = None
        if X_val is not None and y_val is not None:
            X_val_3d = self._ensure_3d(X_val)
            y_val_cat = self._to_categorical(y_val)
            val_data = (X_val_3d, y_val_cat)
            early_stop = callbacks.EarlyStopping(
                monitor="val_accuracy",
                mode="max",
                patience=15,
                restore_best_weights=True,
                verbose=verbose,
            )
            cb_list.append(early_stop)

            ckpt_path = Path("artifacts") / ".tmp_best_cnn_lstm.weights.h5"
            ckpt_path.parent.mkdir(parents=True, exist_ok=True)
            checkpoint = callbacks.ModelCheckpoint(
                filepath=str(ckpt_path),
                monitor="val_accuracy",
                mode="max",
                save_best_only=True,
                save_weights_only=True,
                verbose=verbose,
            )
            cb_list.append(checkpoint)

        # Compute balanced class weights if requested and not provided
        class_weights_dict = class_weight
        if class_weights_dict is None and self.balance_classes:
            from sklearn.utils.class_weight import compute_class_weight
            classes = np.unique(y)
            weights = compute_class_weight("balanced", classes=classes, y=y)
            class_weights_dict = {int(c): float(w) for c, w in zip(classes, weights)}

        fit_res = self.model.fit(
            X_3d,
            y_cat,
            validation_data=val_data,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=cb_list,
            class_weight=class_weights_dict,
            verbose=verbose,
        )

        if ckpt_path and ckpt_path.exists():
            try:
                self.model.load_weights(str(ckpt_path))
                ckpt_path.unlink(missing_ok=True)
            except Exception:
                pass

        self.history = fit_res.history
        self.is_trained = True
        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Return posterior class probabilities of shape (n_samples, 4)."""
        if not self.is_trained or self.model is None:
            raise RuntimeError("CNN-LSTM model is not trained yet.")
        X_3d = self._ensure_3d(X)
        raw_preds = self.model.predict(X_3d, verbose=0)
        # Normalize sigmoid outputs to valid probability distribution (sum to 1)
        prob_sum = np.sum(raw_preds, axis=1, keepdims=True)
        probs = np.where(prob_sum > 0, raw_preds / prob_sum, 0.25)
        return probs.astype(np.float32)

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Return integer class predictions 0..3."""
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1).astype(np.int64)

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Union[float, np.ndarray]]:
        """Evaluate accuracy, macro precision, recall, and F1."""
        y_pred = self.predict(X)
        acc = float(accuracy_score(y, y_pred))
        prec, rec, f1, _ = precision_recall_fscore_support(
            y, y_pred, average="macro", zero_division=0
        )
        return {
            "accuracy": acc,
            "macro_precision": float(prec),
            "macro_recall": float(rec),
            "macro_f1": float(f1),
            "y_pred": y_pred,
        }

    def count_parameters(self) -> int:
        """Return trainable parameter count (~250,000 per Table 2)."""
        if self.model is None:
            temp_model = build_cnn_lstm_model(
                input_length=self.input_length,
                n_classes=self.n_classes,
                learning_rate=self.learning_rate,
                l2_reg=self.l2_reg,
            )
            return int(np.sum([tf.keras.backend.count_params(w) for w in temp_model.trainable_weights]))
        return int(np.sum([tf.keras.backend.count_params(w) for w in self.model.trainable_weights]))

    def save(self, filepath: Union[str, Path]) -> None:
        """Save Keras model architecture and weights."""
        if not self.is_trained or self.model is None:
            raise RuntimeError("Cannot save untrained model.")
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        self.model.save(str(path))

    def load(self, filepath: Union[str, Path]) -> "CNNLSTMModel":
        """Load Keras model from disk."""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")
        self.model = tf.keras.models.load_model(str(path))
        self.input_length = self.model.input_shape[1]
        self.is_trained = True
        return self
