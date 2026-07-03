from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company = Column(String(200), nullable=False)
    role = Column(String(200), nullable=False)
    status = Column(String(50), default="applied")  # "applied", "online_test", "interview", "offered", "rejected"
    date_applied = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    leetcode_progress = Column(String(300), nullable=True)
    resume_version = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="job_applications")


class MastersPrep(Base):
    __tablename__ = "masters_preps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ielts_score = Column(Float, nullable=True)
    gre_score = Column(Integer, nullable=True)
    sop_status = Column(String(50), default="draft")  # "draft", "completed"
    lor_count = Column(Integer, default=0)
    visa_status = Column(String(100), nullable=True)
    loan_status = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="masters_preps")


class UniversityShortlist(Base):
    __tablename__ = "university_shortlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    university_name = Column(String(300), nullable=False)
    program = Column(String(200), nullable=False)
    deadline = Column(Date, nullable=True)
    status = Column(String(50), default="shortlisted")  # "shortlisted", "applying", "submitted", "accepted", "rejected"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="university_shortlists")
