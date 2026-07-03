from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class FitnessLog(Base):
    __tablename__ = "fitness_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    workout_type = Column(String(100), nullable=True)  # Push, Pull, Legs, Cardio, Rest
    duration_minutes = Column(Integer, default=0)
    calories_burned = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    exercises = Column(Text, nullable=True)  # JSON string of exercise list
    attended_gym = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="fitness_logs")


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    weight_kg = Column(Float, nullable=True)
    body_fat_percent = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    chest_cm = Column(Float, nullable=True)
    arms_cm = Column(Float, nullable=True)
    legs_cm = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="body_measurements")
