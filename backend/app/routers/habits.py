from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.schemas.habit import HabitCreate, HabitUpdate, HabitResponse, HabitLogCreate, HabitLogResponse, HabitWithLogs
from app.auth import get_current_user

router = APIRouter()


def update_streak(habit: Habit, db: Session):
    """Recalculate and update habit streak."""
    today = date.today()
    streak = 0
    current_date = today
    while True:
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date == current_date,
            HabitLog.completed == True,
        ).first()
        if log:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    habit.streak = streak
    if streak > habit.longest_streak:
        habit.longest_streak = streak


@router.get("/", response_model=List[HabitResponse])
def get_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Habit).filter(Habit.user_id == current_user.id).all()


@router.post("/", response_model=HabitResponse, status_code=201)
def create_habit(
    data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habit = Habit(**data.model_dump(), user_id=current_user.id)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(
    habit_id: int,
    data: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(habit, k, v)
    db.commit()
    db.refresh(habit)
    return habit


@router.delete("/{habit_id}")
def delete_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habit = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted"}


@router.get("/logs", response_model=List[HabitLogResponse])
def get_habit_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(HabitLog).filter(HabitLog.user_id == current_user.id)
    if start_date:
        query = query.filter(HabitLog.date >= start_date)
    if end_date:
        query = query.filter(HabitLog.date <= end_date)
    return query.order_by(HabitLog.date.desc()).all()


@router.post("/logs", response_model=HabitLogResponse, status_code=201)
def log_habit(
    data: HabitLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habit = db.query(Habit).filter(Habit.id == data.habit_id, Habit.user_id == current_user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    # Upsert: check existing log for this date
    existing = db.query(HabitLog).filter(
        HabitLog.habit_id == data.habit_id,
        HabitLog.date == data.date,
        HabitLog.user_id == current_user.id,
    ).first()

    if existing:
        existing.completed = data.completed
        existing.notes = data.notes
        db.commit()
        log = existing
    else:
        log = HabitLog(**data.model_dump(), user_id=current_user.id)
        db.add(log)
        db.commit()
        db.refresh(log)

    # Update streak
    update_streak(habit, db)
    db.commit()
    return log


@router.get("/today")
def get_today_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True,
    ).all()

    result = []
    for habit in habits:
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date == today,
        ).first()
        result.append({
            "habit": HabitResponse.model_validate(habit),
            "completed": log.completed if log else False,
            "log_id": log.id if log else None,
        })
    return result
