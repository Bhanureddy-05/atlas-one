from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.daily_planner import PlannerTask, PlannerNote, PomodoroSession
from app.schemas.tracking import (
    PlannerTaskCreate, PlannerTaskUpdate, PlannerTaskResponse,
    PlannerNoteCreate, PlannerNoteResponse,
    PomodoroSessionCreate, PomodoroSessionResponse,
)
from app.auth import get_current_user

router = APIRouter()


@router.get("/tasks", response_model=List[PlannerTaskResponse])
def get_tasks(
    task_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(PlannerTask).filter(PlannerTask.user_id == current_user.id)
    if task_date:
        query = query.filter(PlannerTask.date == task_date)
    return query.order_by(PlannerTask.hour_slot.asc().nullsfirst(), PlannerTask.created_at.asc()).all()


@router.post("/tasks", response_model=PlannerTaskResponse, status_code=201)
def create_task(
    data: PlannerTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = PlannerTask(**data.model_dump(), user_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=PlannerTaskResponse)
def update_task(
    task_id: int,
    data: PlannerTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(PlannerTask).filter(
        PlannerTask.id == task_id, PlannerTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.query(PlannerTask).filter(
        PlannerTask.id == task_id, PlannerTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}


@router.get("/notes", response_model=List[PlannerNoteResponse])
def get_notes(
    note_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(PlannerNote).filter(PlannerNote.user_id == current_user.id)
    if note_date:
        query = query.filter(PlannerNote.date == note_date)
    return query.order_by(PlannerNote.created_at.desc()).all()


@router.post("/notes", response_model=PlannerNoteResponse, status_code=201)
def create_note(
    data: PlannerNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = PlannerNote(**data.model_dump(), user_id=current_user.id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/pomodoro", response_model=PomodoroSessionResponse, status_code=201)
def log_pomodoro(
    data: PomodoroSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = PomodoroSession(**data.model_dump(), user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/pomodoro/today")
def get_today_pomodoros(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.date == today,
    ).all()
    total_minutes = sum(s.duration_minutes for s in sessions if s.completed)
    return {"count": len(sessions), "total_minutes": total_minutes, "sessions": sessions}
