from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class InterviewTopic(Base):
    __tablename__ = "interview_topics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)  # Python, SQL, ML, HR, Behavioral
    completion_percent = Column(Float, default=0.0)
    confidence_rating = Column(Integer, default=1)  # 1-5
    notes = Column(Text, nullable=True)
    last_practiced = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="interview_topics")
    sessions = relationship("InterviewSession", back_populates="topic", cascade="all, delete-orphan")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("interview_topics.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    duration_minutes = Column(Integer, default=30)
    session_type = Column(String(50), default="study")  # study, mock_interview, revision
    confidence_rating = Column(Integer, default=3)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interview_sessions")
    topic = relationship("InterviewTopic", back_populates="sessions")
