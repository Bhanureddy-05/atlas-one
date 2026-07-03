from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ProgressPhoto(Base):
    __tablename__ = "progress_photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    photo_path = Column(String(500), nullable=False)
    weight_kg = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="progress_photos")
