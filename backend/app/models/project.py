from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    technology = Column(String(300), nullable=True)  # comma separated
    status = Column(String(50), default="planning")  # planning, in_progress, completed, on_hold
    progress_percent = Column(Float, default=0.0)
    github_url = Column(String(500), nullable=True)
    documentation_url = Column(String(500), nullable=True)
    start_date = Column(Date, nullable=True)
    target_completion = Column(Date, nullable=True)
    completed_date = Column(Date, nullable=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="projects")
