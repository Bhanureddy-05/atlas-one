from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Boolean, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PlannerTask(Base):
    __tablename__ = "planner_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    hour_slot = Column(Integer, nullable=True)  # 0-23 for hour-based planning
    priority = Column(String(20), default="medium")  # low, medium, high
    category = Column(String(100), nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="planner_tasks")


class PlannerNote(Base):
    __tablename__ = "planner_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="planner_notes")


class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    task_name = Column(String(300), nullable=True)
    duration_minutes = Column(Integer, default=25)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="pomodoro_sessions")
