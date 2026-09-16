"""Subjects leaderboard router for NeuroMove backend.
Exposes per-subject classification accuracies and comparative leaderboard derived from metrics.
"""

from fastapi import APIRouter, HTTPException, Query, status
from app.schemas import LeaderboardResponse, SubjectLeaderboardItem
from app.services.metrics import MetricsCalculator
from app.services.inference import DEFAULT_ARTIFACTS_DIR


router = APIRouter(prefix="/api", tags=["Leaderboard"])


@router.get(
    "/subjects",
    response_model=LeaderboardResponse,
    summary="Get per-subject performance leaderboard",
)
async def get_subject_leaderboard(
    mode: str = Query(
        "pooled",
        pattern="^(pooled|subject_dependent)$",
        description="Leaderboard mode: 'pooled' (cross-subject) or 'subject_dependent' (within-subject 10-fold CV)",
    ),
) -> LeaderboardResponse:
    """Returns leaderboard breakdown for subjects (S1..S10 or custom) comparing
    MiniRocket and CNN-LSTM models under either 'pooled' or 'subject_dependent' mode.
    
    If neither model has been trained in the requested mode, returns HTTP 404.
    """
    mr_metrics = None
    cl_metrics = None

    try:
        mr_metrics = MetricsCalculator.load_metrics(DEFAULT_ARTIFACTS_DIR, "minirocket", mode=mode)
    except FileNotFoundError:
        pass

    try:
        cl_metrics = MetricsCalculator.load_metrics(DEFAULT_ARTIFACTS_DIR, "cnn_lstm", mode=mode)
    except FileNotFoundError:
        pass

    if mr_metrics is None and cl_metrics is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No model metrics found for mode '{mode}'. Neither MiniRocket nor CNN-LSTM has been "
                f"trained yet in mode '{mode}'. Please run: python scripts/train.py --mode {mode} --models both"
            ),
        )

    # Collect all subject IDs from available metrics
    subject_ids = set()
    if mr_metrics and "per_subject_accuracy" in mr_metrics:
        subject_ids.update(mr_metrics["per_subject_accuracy"].keys())
    if cl_metrics and "per_subject_accuracy" in cl_metrics:
        subject_ids.update(cl_metrics["per_subject_accuracy"].keys())

    items = []
    mr_accuracies = []
    cl_accuracies = []

    for sub_id in sorted(subject_ids):
        mr_acc = mr_metrics["per_subject_accuracy"].get(sub_id) if mr_metrics else None
        cl_acc = cl_metrics["per_subject_accuracy"].get(sub_id) if cl_metrics else None

        if mr_acc is not None:
            mr_accuracies.append(mr_acc)
        if cl_acc is not None:
            cl_accuracies.append(cl_acc)

        best_model = None
        if mr_acc is not None and cl_acc is not None:
            best_model = "MiniRocket" if mr_acc >= cl_acc else "CNN-LSTM"
        elif mr_acc is not None:
            best_model = "MiniRocket"
        elif cl_acc is not None:
            best_model = "CNN-LSTM"

        # Per-class accuracies (prioritizing MiniRocket or CNN-LSTM)
        per_class = None
        if mr_metrics and sub_id in mr_metrics.get("per_subject_per_class", {}):
            per_class = mr_metrics["per_subject_per_class"][sub_id]
        elif cl_metrics and sub_id in cl_metrics.get("per_subject_per_class", {}):
            per_class = cl_metrics["per_subject_per_class"][sub_id]

        items.append(
            SubjectLeaderboardItem(
                subject_id=sub_id,
                minirocket_accuracy=round(mr_acc, 4) if mr_acc is not None else None,
                cnn_lstm_accuracy=round(cl_acc, 4) if cl_acc is not None else None,
                best_model=best_model,
                per_class_accuracies=per_class,
            )
        )

    mean_mr = round(sum(mr_accuracies) / len(mr_accuracies), 4) if mr_accuracies else None
    mean_cl = round(sum(cl_accuracies) / len(cl_accuracies), 4) if cl_accuracies else None

    return LeaderboardResponse(
        mode=mode,
        subjects=items,
        overall_mean_minirocket=mean_mr,
        overall_mean_cnn_lstm=mean_cl,
    )
