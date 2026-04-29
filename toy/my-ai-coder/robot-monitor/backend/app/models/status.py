from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RobotStatus(Base):
    __tablename__ = "robot_status"

    robot_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("robots.id"), primary_key=True
    )
    battery: Mapped[float | None] = mapped_column(Float, nullable=True)
    position_x: Mapped[float] = mapped_column(Float, default=0.0)
    position_y: Mapped[float] = mapped_column(Float, default=0.0)
    position_z: Mapped[float] = mapped_column(Float, default=0.0)
    speed_linear: Mapped[float] = mapped_column(Float, default=0.0)
    speed_angular: Mapped[float] = mapped_column(Float, default=0.0)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    cpu_usage: Mapped[float | None] = mapped_column(Float, nullable=True)
    memory_usage: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="idle")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    robot = relationship("Robot", back_populates="status")


class StatusHistory(Base):
    __tablename__ = "status_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    robot_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("robots.id"), index=True
    )
    battery: Mapped[float | None] = mapped_column(Float, nullable=True)
    position_x: Mapped[float] = mapped_column(Float, default=0.0)
    position_y: Mapped[float] = mapped_column(Float, default=0.0)
    position_z: Mapped[float] = mapped_column(Float, default=0.0)
    speed_linear: Mapped[float] = mapped_column(Float, default=0.0)
    speed_angular: Mapped[float] = mapped_column(Float, default=0.0)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    cpu_usage: Mapped[float | None] = mapped_column(Float, nullable=True)
    memory_usage: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="idle")
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, index=True
    )

    robot = relationship("Robot", back_populates="status_history")
