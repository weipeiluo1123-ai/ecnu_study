import json
import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections grouped by robot_id."""

    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, robot_id: str, ws: WebSocket):
        await ws.accept()
        self._connections.setdefault(robot_id, []).append(ws)
        logger.info("WebSocket connected: robot=%s, total=%d", robot_id, len(self._connections[robot_id]))

    def disconnect(self, robot_id: str, ws: WebSocket):
        self._connections.setdefault(robot_id, []).remove(ws)
        if not self._connections[robot_id]:
            del self._connections[robot_id]
        logger.info("WebSocket disconnected: robot=%s", robot_id)

    async def broadcast(self, robot_id: str, message: dict):
        """Broadcast a message to all subscribers of a robot."""
        payload = json.dumps(message, default=str)
        for ws in self._connections.get(robot_id, []):
            try:
                await ws.send_text(payload)
            except Exception:
                pass

    @property
    def active_connections(self) -> dict[str, int]:
        return {rid: len(conns) for rid, conns in self._connections.items()}


ws_manager = WebSocketManager()
