from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.singing import SingingSession
from app.schemas.tracking import SingingSessionCreate, SingingSessionResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[SingingSessionResponse])
def get_sessions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(SingingSession).filter(SingingSession.user_id == current_user.id)
    if start_date:
        query = query.filter(SingingSession.date >= start_date)
    if end_date:
        query = query.filter(SingingSession.date <= end_date)
    return query.order_by(SingingSession.date.desc()).all()


@router.post("/", response_model=SingingSessionResponse, status_code=201)
def create_session(
    data: SingingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = SingingSession(**data.model_dump(), user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/stats")
def get_singing_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    week_sessions = db.query(SingingSession).filter(
        SingingSession.user_id == current_user.id,
        SingingSession.date >= week_ago,
    ).all()

    month_sessions = db.query(SingingSession).filter(
        SingingSession.user_id == current_user.id,
        SingingSession.date >= month_ago,
    ).all()

    return {
        "weekly_minutes": sum(s.practice_minutes for s in week_sessions),
        "monthly_minutes": sum(s.practice_minutes for s in month_sessions),
        "weekly_sessions": len(week_sessions),
        "monthly_sessions": len(month_sessions),
    }
