from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.finance import FinanceLog
from app.auth import get_current_user

router = APIRouter()

class FinanceCreate(BaseModel):
    date: date
    transaction_type: str  # "income", "expense", "savings"
    amount: float
    category: str
    description: Optional[str] = None

class FinanceResponse(BaseModel):
    id: int
    date: date
    transaction_type: str
    amount: float
    category: str
    description: Optional[str]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[FinanceResponse])
def get_finance_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(FinanceLog).filter(FinanceLog.user_id == current_user.id)
    if start_date:
        query = query.filter(FinanceLog.date >= start_date)
    if end_date:
        query = query.filter(FinanceLog.date <= end_date)
    return query.order_by(FinanceLog.date.desc()).all()

@router.post("/", response_model=FinanceResponse, status_code=201)
def create_finance_log(
    log_data: FinanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Award 5 XP for keeping track of finances
    current_user.xp += 5
    if current_user.xp >= current_user.level * 100:
        current_user.xp -= current_user.level * 100
        current_user.level += 1

    log = FinanceLog(
        user_id=current_user.id,
        date=log_data.date,
        transaction_type=log_data.transaction_type,
        amount=log_data.amount,
        category=log_data.category,
        description=log_data.description
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.delete("/{log_id}")
def delete_finance_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(FinanceLog).filter(FinanceLog.id == log_id, FinanceLog.user_id == current_user.id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")
    db.delete(log)
    db.commit()
    return {"message": "Transaction deleted successfully"}
