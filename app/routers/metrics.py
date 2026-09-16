"""Metrics router for NeuroMove backend.
Exposes evaluation benchmark artifacts (metrics_<model>.json).
"""

from pathlib import Path
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas import MetricSummary
from app.services.metrics import MetricsCalculator
from app.services.inference import DEFAULT_ARTIFACTS_DIR


router = APIRouter(prefix="/api", tags=["Metrics"])


@router.get(
    "/metrics/{model}",
    response_model=MetricSummary,
    summary="Retrieve evaluation metrics for trained model",
)
async def get_model_metrics(
    model: str,
    mode: str = Query(
        "pooled",
        pattern="^(pooled|subject_dependent)$",
        description="Evaluation protocol mode: 'pooled' (cross-subject) or 'subject_dependent' (within-subject 10-fold CV)",
    ),
) -> MetricSummary:
    """Returns the cached metrics JSON artifact for 'minirocket' or 'cnn_lstm'.
    Supports ?mode=pooled (default) or ?mode=subject_dependent.
    
    If the model has not been trained yet in the requested mode, returns HTTP 404.
    """
    model_lower = model.lower().strip()
    if model_lower not in ["minirocket", "cnn_lstm", "cnnlstm"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid model name '{model}'. Valid options: 'minirocket', 'cnn_lstm'.",
        )

    if model_lower == "cnnlstm":
        model_lower = "cnn_lstm"

    try:
        data = MetricsCalculator.load_metrics(DEFAULT_ARTIFACTS_DIR, model_lower, mode=mode)
        return MetricSummary(**data)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Metrics for model '{model_lower}' in mode '{mode}' not found. "
                f"The model has not been trained yet. Please run: "
                f"python scripts/train.py --mode {mode} --models {model_lower}"
            ),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load metrics: {str(e)}",
        )

