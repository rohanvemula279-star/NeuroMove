"""WebSocket streaming endpoint for NeuroMove backend.
Simulates real-time live playback and streaming inference frames.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from app.services.streaming import stream_service
from app.services.inference import model_service


router = APIRouter(prefix="/api", tags=["Streaming"])


@router.websocket("/stream/{trial_id}")
async def websocket_stream(websocket: WebSocket, trial_id: str):
    """WebSocket endpoint streaming sub-window prediction frames for live playback."""
    await websocket.accept()

    # Validate trial existence
    try:
        _ = model_service.get_trial(trial_id)
    except FileNotFoundError:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason=f"Trial '{trial_id}' does not exist in storage.",
        )
        return

    try:
        # Stream prediction frames
        await stream_service.stream_trial(
            websocket=websocket,
            trial_id=trial_id,
            model_name="minirocket",
            playback_delay_s=0.2,
        )
    except WebSocketDisconnect:
        # Normal client disconnection
        pass
    except Exception as e:
        try:
            await websocket.send_json({"error": str(e)})
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except Exception:
            pass
