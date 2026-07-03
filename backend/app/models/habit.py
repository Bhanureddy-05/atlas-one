from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime
import enum
from app.database import Base


class HabitFrequency(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    color = Column(String(20), default="#6366f1")
    frequency = Column(String(20), default="daily")
    target_time = Column(String(10), nullable=True)  # e.g. "04:30"
    is_active = Column(Boolean, default=True)
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="habit_logs")
    habit = relationship("Habit", back_populates="logs")
