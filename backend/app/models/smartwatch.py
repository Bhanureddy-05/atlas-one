from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class SmartwatchSync(Base):
    __tablename__ = "smartwatch_syncs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)  # "google_fit", "apple_health", "garmin", "fitbit"
    last_sync_time = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    sync_status = Column(String(50), default="success")  # "success", "failed"
    metrics_data = Column(JSON, nullable=True)

    user = relationship("User", back_populates="smartwatch_syncs")
