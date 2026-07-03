from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class GoogleCalendarCredential(Base):
    __tablename__ = "google_calendar_credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    access_token = Column(String(500), nullable=False)
    refresh_token = Column(String(500), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="google_calendar_credentials")
