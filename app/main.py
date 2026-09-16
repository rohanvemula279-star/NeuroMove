"""FastAPI Application Entrypoint for NeuroMove.
Based on Hwaidi & Ghanem (NeuroImage 328, 2026).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.upload import router as upload_router
from app.routers.predict import router as predict_router
from app.routers.stream import router as stream_router
from app.routers.metrics import router as metrics_router
from app.routers.subjects import router as subjects_router


app = FastAPI(
    title="NeuroMove: Motor Imagery EEG Classification API",
    description=(
        "Production backend for Motor Imagery EEG classification based on "
        "'Motor imagery EEG signal classification using minimally random convolutional "
        "kernel transform and hybrid deep learning' (Hwaidi & Ghanem, NeuroImage 328, 2026). "
        "Supports MiniRocket+Ridge, 13-layer CNN-LSTM, PhysioNet EEGMMIDB preprocessing, "
        "real-time streaming playback, and comprehensive benchmarking."
    ),
    version="2.0.0",
)

# Enable CORS for http://localhost:5173 (Vite frontend) and standard local origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:80",
        "http://127.0.0.1:80",
        "http://localhost",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(upload_router)
app.include_router(predict_router)
app.include_router(stream_router)
app.include_router(metrics_router)
app.include_router(subjects_router)


@app.get("/", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "system": "NeuroMove EEG Classification Backend",
        "version": "2.0.0",
        "status": "online",
        "paper": "Hwaidi & Ghanem (NeuroImage 328, 2026)",
        "endpoints": [
            "POST /api/upload",
            "POST /api/predict/{trial_id}?model=minirocket|cnn_lstm|both",
            "WS   /api/stream/{trial_id}",
            "GET  /api/metrics/{model}",
            "GET  /api/subjects",
        ],
    }
