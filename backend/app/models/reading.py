from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(400), nullable=False)
    author = Column(String(300), nullable=True)
    genre = Column(String(100), nullable=True)
    total_pages = Column(Integer, default=0)
    pages_read = Column(Integer, default=0)
    completion_percent = Column(Float, default=0.0)
    status = Column(String(30), default="reading")  # reading, completed, want_to_read, on_hold
    start_date = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5
    notes = Column(Text, nullable=True)
    highlights = Column(Text, nullable=True)  # JSON string
    cover_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="books")
    sessions = relationship("ReadingSession", back_populates="book", cascade="all, delete-orphan")


class ReadingSession(Base):
    __tablename__ = "reading_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    pages_read = Column(Integer, default=0)
    reading_minutes = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reading_sessions")
    book = relationship("Book", back_populates="sessions")
