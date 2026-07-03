from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class StudyTopic(Base):
    __tablename__ = "study_topics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)  # e.g. "Python", "ML", "Deep Learning"
    completion_percent = Column(Float, default=0.0)
    total_hours = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    resources = Column(Text, nullable=True)  # JSON string of resource links
    last_revised = Column(Date, nullable=True)
    target_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="study_topics")
    sessions = relationship("StudySession", back_populates="topic", cascade="all, delete-orphan")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("study_topics.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    hours = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="study_sessions")
    topic = relationship("StudyTopic", back_populates="sessions")
