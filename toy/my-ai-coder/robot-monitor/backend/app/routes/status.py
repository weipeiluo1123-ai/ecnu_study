from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.robot import Robot
from app.models.status import RobotStatus, StatusHistory
from app.schemas.robot import (
    RobotStatusOut,
    StatusHistoryListOut,
    StatusHistoryOut,
)

router = APIRouter(prefix="/api/robots", tags=["status"])


@router.get("/{robot_id}/status", response_model=RobotStatusOut)
async def get_robot_status(robot_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    status_result = await db.execute(
        select(RobotStatus).where(RobotStatus.robot_id == robot_id)
    )
    status = status_result.scalar_one_or_none()
    if not status:
        return RobotStatusOut()
    return RobotStatusOut.model_validate(status)


@router.get("/{robot_id}/history", response_model=StatusHistoryListOut)
async def get_status_history(
    robot_id: str,
    start_time: datetime | None = Query(
        default=None, description="Start of time range"
    ),
    end_time: datetime | None = Query(
        default=None, description="End of time range"
    ),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    # Default: last 24 hours
    if start_time is None:
        start_time = datetime.utcnow() - timedelta(hours=24)
    if end_time is None:
        end_time = datetime.utcnow()

    count_query = select(func.count(StatusHistory.id)).where(
        StatusHistory.robot_id == robot_id,
        StatusHistory.recorded_at >= start_time,
        StatusHistory.recorded_at <= end_time,
    )
    total = (await db.execute(count_query)).scalar() or 0

    query = (
        select(StatusHistory)
        .where(
            StatusHistory.robot_id == robot_id,
            StatusHistory.recorded_at >= start_time,
            StatusHistory.recorded_at <= end_time,
        )
        .order_by(StatusHistory.recorded_at.desc())
        .offset(offset)
        .limit(limit)
    )
    rows = (await db.execute(query)).scalars().all()

    history = [StatusHistoryOut.model_validate(r) for r in rows]
    return StatusHistoryListOut(history=history, total=total, limit=limit, offset=offset)
