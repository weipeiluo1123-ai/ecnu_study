import logging
import random
import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.robot import Robot
from app.models.status import RobotStatus, StatusHistory
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

ROBOT_NAMES = ["Titan", "Sparky", "MegaBot", "Nano", "Ironclaw", "Drift"]


async def seed_demo_robots():
    """Create demo robots if none exist."""
    async with async_session() as db:
        result = await db.execute(select(Robot).limit(1))
        if result.scalar_one_or_none():
            return

        for i, name in enumerate(ROBOT_NAMES):
            robot = Robot(
                name=name,
                model=f"R-{random.randint(100, 999)}",
                is_online=True,
            )
            db.add(robot)
            await db.flush()

            status = RobotStatus(
                robot_id=robot.id,
                battery=random.uniform(20, 100),
                position_x=random.uniform(-5, 5),
                position_y=random.uniform(-5, 5),
                position_z=0.0,
                speed_linear=random.uniform(0, 1.5),
                speed_angular=random.uniform(-0.5, 0.5),
                temperature=random.uniform(25, 45),
                cpu_usage=random.uniform(10, 80),
                memory_usage=random.uniform(20, 70),
                status=random.choice(["running", "idle", "charging"]),
            )
            db.add(status)

        await db.commit()
        logger.info("Seeded %d demo robots", len(ROBOT_NAMES))


async def simulate_status_update():
    """Periodic task: update status for all online robots and broadcast via WebSocket."""
    async with async_session() as db:
        result = await db.execute(select(Robot).where(Robot.is_online == True))
        robots = result.scalars().all()

        for robot in robots:
            status = _generate_status(robot.id)

            # Upsert current status
            current = await db.execute(
                select(RobotStatus).where(RobotStatus.robot_id == robot.id)
            )
            existing = current.scalar_one_or_none()
            if existing:
                for key, val in status.items():
                    setattr(existing, key, val)
            else:
                db.add(RobotStatus(robot_id=robot.id, **status))

            # Insert history record
            history = StatusHistory(robot_id=robot.id, **status)
            db.add(history)

            # Broadcast via WebSocket
            msg = {
                "type": "status_update",
                "data": {
                    "robot_id": robot.id,
                    "timestamp": datetime.utcnow().isoformat(),
                    **status,
                },
            }
            await ws_manager.broadcast(robot.id, msg)

        await db.commit()


def _generate_status(robot_id: str) -> dict:
    """Generate realistic-ish status data."""
    return {
        "battery": max(0, min(100, round(random.gauss(70, 15), 1))),
        "position_x": round(random.uniform(-5, 5), 2),
        "position_y": round(random.uniform(-5, 5), 2),
        "position_z": 0.0,
        "speed_linear": round(random.uniform(0, 2.0), 2),
        "speed_angular": round(random.uniform(-1.0, 1.0), 2),
        "temperature": round(random.uniform(25, 50), 1),
        "cpu_usage": round(random.uniform(5, 95), 1),
        "memory_usage": round(random.uniform(10, 90), 1),
        "status": random.choice(["running", "running", "running", "idle", "charging"]),
    }
