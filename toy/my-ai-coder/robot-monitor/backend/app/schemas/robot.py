from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── 机器人 CRUD ──

class RobotCreate(BaseModel):
    name: str = Field(..., max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    is_online: bool = False
    # Optional initial status fields
    battery: Optional[float] = Field(None, ge=0, le=100)
    position_x: float = 0.0
    position_y: float = 0.0
    position_z: float = 0.0
    speed_linear: float = 0.0
    speed_angular: float = 0.0
    temperature: Optional[float] = None
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None
    status: str = "idle"


class RobotStatusOut(BaseModel):
    model_config = {"from_attributes": True}

    battery: Optional[float] = None
    position_x: float = 0.0
    position_y: float = 0.0
    position_z: float = 0.0
    speed_linear: float = 0.0
    speed_angular: float = 0.0
    temperature: Optional[float] = None
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None
    status: str = "idle"
    updated_at: Optional[datetime] = None


class RobotOut(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    name: str
    model: Optional[str] = None
    is_online: bool = False
    status: Optional[RobotStatusOut] = None
    created_at: datetime
    updated_at: datetime


class RobotListOut(BaseModel):
    robots: list[RobotOut]


# ── 状态 ──

class StatusHistoryOut(BaseModel):
    model_config = {"from_attributes": True}

    recorded_at: datetime
    battery: Optional[float] = None
    speed_linear: float = 0.0
    speed_angular: float = 0.0
    temperature: Optional[float] = None
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None
    status: str = "idle"


class StatusHistoryListOut(BaseModel):
    history: list[StatusHistoryOut]
    total: int
    limit: int
    offset: int


# ── WebSocket ──

class WSMessage(BaseModel):
    type: str
    data: Optional[dict] = None
