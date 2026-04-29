from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.robot import Robot
from app.models.status import RobotStatus
from app.schemas.robot import RobotCreate, RobotListOut, RobotOut, RobotStatusOut

router = APIRouter(prefix="/api/robots", tags=["robots"])


async def _attach_status(robot: Robot, db: AsyncSession) -> RobotOut:
    """Helper: attach current status to a robot."""
    result = await db.execute(
        select(RobotStatus).where(RobotStatus.robot_id == robot.id)
    )
    status = result.scalar_one_or_none()
    status_out = RobotStatusOut.model_validate(status) if status else None
    return RobotOut(
        id=robot.id,
        name=robot.name,
        model=robot.model,
        is_online=robot.is_online,
        status=status_out,
        created_at=robot.created_at,
        updated_at=robot.updated_at,
    )


@router.get("", response_model=RobotListOut)
async def list_robots(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Robot).order_by(Robot.created_at.desc()))
    robots = result.scalars().all()
    items = [await _attach_status(r, db) for r in robots]
    return RobotListOut(robots=items)


@router.post("", response_model=RobotOut, status_code=201)
async def create_robot(body: RobotCreate, db: AsyncSession = Depends(get_db)):
    robot = Robot(
        name=body.name,
        model=body.model,
        is_online=body.is_online,
    )
    db.add(robot)
    await db.flush()

    robot_status = RobotStatus(
        robot_id=robot.id,
        battery=body.battery,
        position_x=body.position_x,
        position_y=body.position_y,
        position_z=body.position_z,
        speed_linear=body.speed_linear,
        speed_angular=body.speed_angular,
        temperature=body.temperature,
        cpu_usage=body.cpu_usage,
        memory_usage=body.memory_usage,
        status=body.status,
    )
    db.add(robot_status)
    await db.commit()
    await db.refresh(robot)
    return await _attach_status(robot, db)


@router.get("/{robot_id}", response_model=RobotOut)
async def get_robot(robot_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    return await _attach_status(robot, db)


@router.delete("/{robot_id}", status_code=204)
async def delete_robot(robot_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    await db.delete(robot)
    await db.commit()
