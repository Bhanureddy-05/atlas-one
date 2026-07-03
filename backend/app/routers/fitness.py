from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.fitness import FitnessLog, BodyMeasurement
from app.schemas.tracking import (
    FitnessLogCreate, FitnessLogUpdate, FitnessLogResponse,
    BodyMeasurementCreate, BodyMeasurementResponse,
)
from app.auth import get_current_user

router = APIRouter()


@router.get("/logs", response_model=List[FitnessLogResponse])
def get_fitness_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(FitnessLog).filter(FitnessLog.user_id == current_user.id)
    if start_date:
        query = query.filter(FitnessLog.date >= start_date)
    if end_date:
        query = query.filter(FitnessLog.date <= end_date)
    return query.order_by(FitnessLog.date.desc()).all()


@router.post("/logs", response_model=FitnessLogResponse, status_code=201)
def create_fitness_log(
    data: FitnessLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = FitnessLog(**data.model_dump(), user_id=current_user.id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.put("/logs/{log_id}", response_model=FitnessLogResponse)
def update_fitness_log(
    log_id: int,
    data: FitnessLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.query(FitnessLog).filter(
        FitnessLog.id == log_id, FitnessLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(log, k, v)
    db.commit()
    db.refresh(log)
    return log


@router.get("/measurements", response_model=List[BodyMeasurementResponse])
def get_measurements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    ).order_by(BodyMeasurement.date.desc()).all()


@router.post("/measurements", response_model=BodyMeasurementResponse, status_code=201)
def create_measurement(
    data: BodyMeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    m = BodyMeasurement(**data.model_dump(), user_id=current_user.id)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.get("/stats")
def get_fitness_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    gym_days_week = db.query(FitnessLog).filter(
        FitnessLog.user_id == current_user.id,
        FitnessLog.date >= week_ago,
        FitnessLog.attended_gym == True,
    ).count()

    gym_days_month = db.query(FitnessLog).filter(
        FitnessLog.user_id == current_user.id,
        FitnessLog.date >= month_ago,
        FitnessLog.attended_gym == True,
    ).count()

    latest = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    ).order_by(BodyMeasurement.date.desc()).first()

    weight_history = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id,
        BodyMeasurement.date >= month_ago,
    ).order_by(BodyMeasurement.date.asc()).all()

    return {
        "gym_days_this_week": gym_days_week,
        "gym_days_this_month": gym_days_month,
        "latest_measurements": BodyMeasurementResponse.model_validate(latest) if latest else None,
        "weight_history": [
            {"date": str(m.date), "weight": m.weight_kg} for m in weight_history
        ],
    }
