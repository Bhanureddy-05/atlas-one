from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    goal_type = Column(String(20), default="daily")  # daily, weekly, monthly, yearly
    category = Column(String(100), nullable=True)  # study, fitness, reading, etc.
    target_value = Column(Float, nullable=True)
    current_value = Column(Float, default=0.0)
    unit = Column(String(50), nullable=True)  # hours, pages, kg, etc.
    completion_percent = Column(Float, default=0.0)
    is_completed = Column(Boolean, default=False)
    start_date = Column(Date, nullable=True)
    target_date = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="goals")
