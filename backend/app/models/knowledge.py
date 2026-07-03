from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    content_type = Column(String(50), default="note")  # "note", "idea", "research", "quote"
    content = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="knowledge_items")
