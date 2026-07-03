from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.sleep import SleepLog
from app.schemas.tracking import SleepLogCreate, SleepLogUpdate, SleepLogResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[SleepLogResponse])
def get_sleep_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(SleepLog).filter(SleepLog.user_id == current_user.id)
    if start_date:
        query = query.filter(SleepLog.date >= start_date)
    if end_date:
        query = query.filter(SleepLog.date <= end_date)
    return query.order_by(SleepLog.date.desc()).all()


@router.post("/", response_model=SleepLogResponse, status_code=201)
def create_sleep_log(
    data: SleepLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = SleepLog(**data.model_dump(), user_id=current_user.id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.put("/{log_id}", response_model=SleepLogResponse)
def update_sleep_log(
    log_id: int,
    data: SleepLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.query(SleepLog).filter(
        SleepLog.id == log_id, SleepLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Sleep log not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(log, k, v)
    db.commit()
    db.refresh(log)
    return log


@router.get("/stats")
def get_sleep_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    week_logs = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id,
        SleepLog.date >= week_ago,
    ).all()

    month_logs = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id,
        SleepLog.date >= month_ago,
    ).all()

    week_avg = sum(l.hours for l in week_logs if l.hours) / max(len(week_logs), 1)
    month_avg = sum(l.hours for l in month_logs if l.hours) / max(len(month_logs), 1)

    return {
        "weekly_avg_hours": round(week_avg, 1),
        "monthly_avg_hours": round(month_avg, 1),
        "week_data": [{"date": str(l.date), "hours": l.hours, "quality": l.quality} for l in week_logs],
    }
