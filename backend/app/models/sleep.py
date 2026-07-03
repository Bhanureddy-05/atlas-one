from sqlalchemy import Column, Integer, String, Float, Date, Time, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    sleep_time = Column(String(10), nullable=True)   # "22:00"
    wake_time = Column(String(10), nullable=True)    # "06:00"
    hours = Column(Float, nullable=True)
    quality = Column(Integer, default=3)  # 1-5
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sleep_logs")
