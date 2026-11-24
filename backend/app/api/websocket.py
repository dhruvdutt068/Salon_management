from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
from app.websocket.connection_manager import ws_manager

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger("websocket")

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep receiving pings or heartbeat messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
