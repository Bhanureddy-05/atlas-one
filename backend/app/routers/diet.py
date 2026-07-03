from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.diet import FoodLog, FoodItem
from app.schemas.tracking import FoodLogCreate, FoodLogResponse, DietSummary
from app.auth import get_current_user

router = APIRouter()


@router.get("/logs", response_model=List[FoodLogResponse])
def get_food_logs(
    log_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(FoodLog).filter(FoodLog.user_id == current_user.id)
    if log_date:
        query = query.filter(FoodLog.date == log_date)
    return query.order_by(FoodLog.date.desc(), FoodLog.created_at.asc()).all()


@router.post("/logs", response_model=FoodLogResponse, status_code=201)
def create_food_log(
    data: FoodLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = FoodLog(**data.model_dump(), user_id=current_user.id)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/logs/{log_id}")
def delete_food_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = db.query(FoodLog).filter(
        FoodLog.id == log_id, FoodLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
    return {"message": "Food log deleted"}


@router.get("/summary/{log_date}", response_model=DietSummary)
def get_diet_summary(
    log_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.date == log_date,
    ).all()

    return DietSummary(
        date=log_date,
        total_calories=sum(l.calories for l in logs),
        total_protein=sum(l.protein_g for l in logs),
        total_carbs=sum(l.carbs_g for l in logs),
        total_fat=sum(l.fat_g for l in logs),
        total_fiber=sum(l.fiber_g for l in logs),
        total_water_ml=sum(l.water_ml for l in logs),
        meal_count=len(logs),
    )
