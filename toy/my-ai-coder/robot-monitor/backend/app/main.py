import asyncio
import logging

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routes import robots as robots_router
from app.routes import status as status_router
from app.services.robot_service import seed_demo_robots, simulate_status_update
from app.websocket.manager import ws_manager

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Robot Monitor API",
    description="Real-time robot status monitoring dashboard backend",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(robots_router.router)
app.include_router(status_router.router)


# ── WebSocket endpoint ──

@app.websocket("/ws/{robot_id}")
async def websocket_endpoint(websocket: WebSocket, robot_id: str):
    await ws_manager.connect(robot_id, websocket)
    try:
        while True:
            # Keep connection alive, receive pings/pongs
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(robot_id, websocket)
    except Exception:
        ws_manager.disconnect(robot_id, websocket)


# ── Startup / Shutdown ──

_sim_task: asyncio.Task | None = None


@app.on_event("startup")
async def startup():
    await init_db()
    await seed_demo_robots()

    global _sim_task
    _sim_task = asyncio.create_task(_run_simulation_loop())
    logger.info("Robot Monitor API started")


@app.on_event("shutdown")
async def shutdown():
    if _sim_task:
        _sim_task.cancel()
    logger.info("Robot Monitor API stopped")


async def _run_simulation_loop():
    """Periodically update robot statuses."""
    while True:
        try:
            await simulate_status_update()
        except Exception as e:
            logger.error("Simulation error: %s", e)
        await asyncio.sleep(settings.STATUS_UPDATE_INTERVAL)


# ── Entry ──

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
