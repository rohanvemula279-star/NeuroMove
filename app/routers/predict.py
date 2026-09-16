"""Prediction router for NeuroMove backend.
Executes inference on uploaded trials using MiniRocket, CNN-LSTM, or both models.
"""

from typing import List, Union
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas import ModelPrediction
from app.services.inference import model_service


router = APIRouter(prefix="/api", tags=["Inference"])


@router.post(
    "/predict/{trial_id}",
    response_model=List[ModelPrediction],
    summary="Run Motor Imagery prediction on preprocessed trial",
)
async def predict_trial(
    trial_id: str,
    model: str = Query(
        "both",
        description="Classifier model to use: 'minirocket', 'cnn_lstm', or 'both'",
    ),
) -> List[ModelPrediction]:
    """Execute classification inference on an uploaded trial.
    Returns predicted label, class probabilities, and CPU latency in milliseconds.
    
    If the requested model is not yet trained, returns an informative error.
    """
    model_lower = model.lower().strip()
    if model_lower not in ["minirocket", "cnn_lstm", "both"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid model query param '{model}'. Choose from: 'minirocket', 'cnn_lstm', 'both'.",
        )

    # Check model availability
    if model_lower in ["minirocket", "both"] and not model_service.is_model_available("minirocket"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "MiniRocket model is not trained yet. "
                "Run 'python scripts/train.py --models minirocket' before requesting predictions."
            ),
        )

    if model_lower in ["cnn_lstm", "both"] and not model_service.is_model_available("cnn_lstm"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "CNN-LSTM hybrid model is not trained yet. "
                "Run 'python scripts/train.py --models cnn_lstm' before requesting predictions."
            ),
        )

    try:
        predictions = model_service.predict_trial(trial_id, model_choice=model_lower)
        return predictions
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )
