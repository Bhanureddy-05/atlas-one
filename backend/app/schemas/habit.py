from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#6366f1"
    frequency: str = "daily"
    target_time: Optional[str] = None


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    frequency: Optional[str] = None
    target_time: Optional[str] = None
    is_active: Optional[bool] = None


class HabitResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str
    frequency: str
    target_time: Optional[str] = None
    is_active: bool
    streak: int
    longest_streak: int
    created_at: datetime

    class Config:
        from_attributes = True


class HabitLogCreate(BaseModel):
    habit_id: int
    date: date
    completed: bool = True
    notes: Optional[str] = None


class HabitLogResponse(BaseModel):
    id: int
    habit_id: int
    date: date
    completed: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class HabitWithLogs(HabitResponse):
    logs: List[HabitLogResponse] = []
