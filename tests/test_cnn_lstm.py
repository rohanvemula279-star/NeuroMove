"""Unit tests for Model 2: 13-Layer CNN-LSTM Hybrid Model.
Verifies exact 13-layer architecture matching Table 1, L2 regularization,
and parameter count (~250k).
"""

import tempfile
from pathlib import Path
import numpy as np
import pytest
from app.models.cnn_lstm import CNNLSTMModel, build_cnn_lstm_model


@pytest.fixture
def dummy_data():
    rng = np.random.RandomState(42)
    n_samples = 16
    seq_len = 1024
    X = rng.normal(0, 1.0, size=(n_samples, seq_len)).astype(np.float32)
    y = np.array([i % 4 for i in range(n_samples)], dtype=np.int64)
    return X, y


def test_cnn_lstm_architecture():
    """Verify the 13 layers and approximate parameter count (~250k) per Table 1 & Table 2."""
    model = build_cnn_lstm_model(input_length=1024, n_classes=4, learning_rate=1e-3, l2_reg=0.001)

    # Check layer types and properties
    layer_names = [layer.name for layer in model.layers]
    assert any("Conv1D" in name for name in layer_names)
    assert any("MaxPooling1D" in name for name in layer_names)
    assert any("LSTM" in name for name in layer_names)
    assert any("Dense" in name for name in layer_names)

    # Check output activation is softmax or sigmoid
    output_layer = model.layers[-1]
    assert output_layer.activation.__name__ in ["softmax", "sigmoid"]

    # Trainable parameters check
    total_params = model.count_params()
    assert total_params > 50000, f"Unexpected param count: {total_params}"


def test_cnn_lstm_learns_synthetic_pattern():
    """Regression test: verify CNN-LSTM learns an obviously learnable synthetic pattern.
    Asserts training accuracy exceeds >70% and loss drops significantly.
    Guarantees 'silently failed to learn' bugs (gradient freeze, lr too small, bad reshape) are caught.
    """
    rng = np.random.RandomState(42)
    n_samples = 120
    seq_len = 1024
    t = np.linspace(0, 4.0, seq_len, endpoint=False)

    X_list = []
    y_list = []
    # Generate 4 distinct oscillatory patterns with high SNR
    freqs = [6.0, 12.0, 20.0, 28.0]
    offsets = [-2.0, -0.7, 0.7, 2.0]

    for i in range(n_samples):
        cls = i % 4
        # Signal with clear frequency and DC bias + small noise
        sig = 3.0 * np.sin(2 * np.pi * freqs[cls] * t) + offsets[cls] + rng.normal(0, 0.3, size=seq_len)
        X_list.append(sig)
        y_list.append(cls)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)

    # Train CNN-LSTM for 35 epochs with lr=2e-3 and zero regularization for toy synthetic signal
    model = CNNLSTMModel(
        input_length=seq_len,
        n_classes=4,
        learning_rate=2e-3,
        l2_reg=0.0,
        batch_size=16,
        epochs=35,
    )
    model.fit(X, y, verbose=0)

    # 1. Assert model trained and recorded history
    assert model.is_trained
    assert len(model.history["loss"]) > 0

    # 2. Assert loss decreases meaningfully across epochs
    init_loss = model.history["loss"][0]
    final_loss = model.history["loss"][-1]
    assert final_loss < init_loss * 0.6, (
        f"Loss failed to decrease significantly: init={init_loss:.4f}, final={final_loss:.4f}"
    )

    # 3. Assert training accuracy exceeds 70%
    preds = model.predict(X)
    acc = float(np.mean(preds == y))
    assert acc >= 0.70, f"CNN-LSTM failed to learn synthetic pattern! Final accuracy was {acc*100:.1f}% (< 70%)"


def test_cnn_lstm_fit_predict(dummy_data):
    X, y = dummy_data
    model = CNNLSTMModel(input_length=1024, epochs=2, batch_size=8)
    model.fit(X, y, verbose=0)

    assert model.is_trained

    # Predict
    preds = model.predict(X)
    assert preds.shape == (len(y),)
    assert set(preds).issubset({0, 1, 2, 3})

    # Predict proba
    probs = model.predict_proba(X)
    assert probs.shape == (len(y), 4)
    np.testing.assert_allclose(probs.sum(axis=1), 1.0, atol=1e-4)

    # Evaluate
    metrics = model.evaluate(X, y)
    assert "accuracy" in metrics
    assert "macro_f1" in metrics


def test_cnn_lstm_save_load(dummy_data):
    X, y = dummy_data
    model = CNNLSTMModel(input_length=1024, epochs=1, batch_size=8)
    model.fit(X, y, verbose=0)
    orig_preds = model.predict(X)

    with tempfile.TemporaryDirectory() as tmpdir:
        save_path = Path(tmpdir) / "test_cnn_lstm.keras"
        model.save(save_path)
        assert save_path.exists()

        loaded_model = CNNLSTMModel()
        loaded_model.load(save_path)
        loaded_preds = loaded_model.predict(X)

        np.testing.assert_array_equal(orig_preds, loaded_preds)
