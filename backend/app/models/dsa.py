from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class DSATopic(Base):
    __tablename__ = "dsa_topics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    last_revised = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="dsa_topics")
    problems = relationship("DSAProblem", back_populates="topic", cascade="all, delete-orphan")


class DSAProblem(Base):
    __tablename__ = "dsa_problems"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("dsa_topics.id"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    difficulty = Column(String(20), nullable=False)  # easy, medium, hard
    status = Column(String(20), default="todo")  # todo, attempted, solved
    leetcode_url = Column(String(500), nullable=True)
    company_tags = Column(Text, nullable=True)  # JSON string
    notes = Column(Text, nullable=True)
    solved_date = Column(Date, nullable=True)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="dsa_problems")
    topic = relationship("DSATopic", back_populates="problems")
