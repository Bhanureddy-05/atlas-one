from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    entry_type = Column(String(20), nullable=False)  # "morning", "night"
    mood = Column(Integer, default=3)  # 1-5 rating
    gratitude_1 = Column(String(500), nullable=True)
    gratitude_2 = Column(String(500), nullable=True)
    gratitude_3 = Column(String(500), nullable=True)
    reflection = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="journal_entries")
