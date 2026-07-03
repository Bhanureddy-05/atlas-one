from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class VoiceJournal(Base):
    __tablename__ = "voice_journals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    audio_path = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    mood = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="voice_journals")
