from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SingingSession(Base):
    __tablename__ = "singing_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    practice_minutes = Column(Integer, default=0)
    breathing_exercises_minutes = Column(Integer, default=0)
    alankars_practiced = Column(Integer, default=0)
    songs_practiced = Column(Text, nullable=True)  # JSON list
    songs_learned = Column(Text, nullable=True)    # JSON list
    voice_notes = Column(Text, nullable=True)
    quality_rating = Column(Integer, default=3)  # 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="singing_sessions")
