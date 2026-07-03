from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class FinanceLog(Base):
    __tablename__ = "finance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    transaction_type = Column(String(30), nullable=False)  # "income", "expense", "savings"
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="finance_logs")
