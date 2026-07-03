from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.goal import Goal
from app.schemas.tracking import GoalCreate, GoalUpdate, GoalResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[GoalResponse])
def get_goals(
    goal_type: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    if goal_type:
        query = query.filter(Goal.goal_type == goal_type)
    if category:
        query = query.filter(Goal.category == category)
    return query.order_by(Goal.created_at.desc()).all()


@router.post("/", response_model=GoalResponse, status_code=201)
def create_goal(
    data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = Goal(**data.model_dump(), user_id=current_user.id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(goal, k, v)
    if goal.target_value and goal.target_value > 0:
        goal.completion_percent = min((goal.current_value / goal.target_value) * 100, 100)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}
