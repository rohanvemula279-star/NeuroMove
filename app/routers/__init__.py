"""API Routers package for NeuroMove.
"""

from app.routers.upload import router as upload_router
from app.routers.predict import router as predict_router
from app.routers.stream import router as stream_router
from app.routers.metrics import router as metrics_router
from app.routers.subjects import router as subjects_router

__all__ = [
    "upload_router",
    "predict_router",
    "stream_router",
    "metrics_router",
    "subjects_router",
]
