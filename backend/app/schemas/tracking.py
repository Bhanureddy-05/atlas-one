from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# ── Fitness ───────────────────────────────────────────────────────────────────
class FitnessLogCreate(BaseModel):
    date: date
    workout_type: Optional[str] = None
    duration_minutes: int = 0
    calories_burned: float = 0.0
    notes: Optional[str] = None
    exercises: Optional[str] = None
    attended_gym: bool = False


class FitnessLogUpdate(BaseModel):
    workout_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[float] = None
    notes: Optional[str] = None
    exercises: Optional[str] = None
    attended_gym: Optional[bool] = None


class FitnessLogResponse(BaseModel):
    id: int
    date: date
    workout_type: Optional[str] = None
    duration_minutes: int
    calories_burned: float
    notes: Optional[str] = None
    exercises: Optional[str] = None
    attended_gym: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BodyMeasurementCreate(BaseModel):
    date: date
    weight_kg: Optional[float] = None
    body_fat_percent: Optional[float] = None
    waist_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    legs_cm: Optional[float] = None
    notes: Optional[str] = None


class BodyMeasurementResponse(BaseModel):
    id: int
    date: date
    weight_kg: Optional[float] = None
    body_fat_percent: Optional[float] = None
    waist_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    legs_cm: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Diet ──────────────────────────────────────────────────────────────────────
class FoodLogCreate(BaseModel):
    date: date
    meal_type: str  # breakfast, lunch, dinner, snack, water
    food_name: str
    quantity_g: float = 100.0
    calories: float = 0.0
    protein_g: float = 0.0
    carbs_g: float = 0.0
    fat_g: float = 0.0
    fiber_g: float = 0.0
    water_ml: float = 0.0
    notes: Optional[str] = None
    food_item_id: Optional[int] = None


class FoodLogResponse(BaseModel):
    id: int
    date: date
    meal_type: str
    food_name: str
    quantity_g: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    water_ml: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DietSummary(BaseModel):
    date: date
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    total_fiber: float
    total_water_ml: float
    meal_count: int


# ── Sleep ─────────────────────────────────────────────────────────────────────
class SleepLogCreate(BaseModel):
    date: date
    sleep_time: Optional[str] = None
    wake_time: Optional[str] = None
    hours: Optional[float] = None
    quality: int = 3
    notes: Optional[str] = None


class SleepLogUpdate(BaseModel):
    sleep_time: Optional[str] = None
    wake_time: Optional[str] = None
    hours: Optional[float] = None
    quality: Optional[int] = None
    notes: Optional[str] = None


class SleepLogResponse(BaseModel):
    id: int
    date: date
    sleep_time: Optional[str] = None
    wake_time: Optional[str] = None
    hours: Optional[float] = None
    quality: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Singing ───────────────────────────────────────────────────────────────────
class SingingSessionCreate(BaseModel):
    date: date
    practice_minutes: int = 0
    breathing_exercises_minutes: int = 0
    alankars_practiced: int = 0
    songs_practiced: Optional[str] = None
    songs_learned: Optional[str] = None
    voice_notes: Optional[str] = None
    quality_rating: int = 3


class SingingSessionResponse(BaseModel):
    id: int
    date: date
    practice_minutes: int
    breathing_exercises_minutes: int
    alankars_practiced: int
    songs_practiced: Optional[str] = None
    songs_learned: Optional[str] = None
    voice_notes: Optional[str] = None
    quality_rating: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Reading ───────────────────────────────────────────────────────────────────
class BookCreate(BaseModel):
    title: str
    author: Optional[str] = None
    genre: Optional[str] = None
    total_pages: int = 0
    cover_url: Optional[str] = None


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    genre: Optional[str] = None
    total_pages: Optional[int] = None
    pages_read: Optional[int] = None
    status: Optional[str] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    highlights: Optional[str] = None
    start_date: Optional[date] = None
    completed_date: Optional[date] = None


class BookResponse(BaseModel):
    id: int
    title: str
    author: Optional[str] = None
    genre: Optional[str] = None
    total_pages: int
    pages_read: int
    completion_percent: float
    status: str
    start_date: Optional[date] = None
    completed_date: Optional[date] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    highlights: Optional[str] = None
    cover_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReadingSessionCreate(BaseModel):
    book_id: int
    date: date
    pages_read: int = 0
    reading_minutes: int = 0
    notes: Optional[str] = None


class ReadingSessionResponse(BaseModel):
    id: int
    book_id: int
    date: date
    pages_read: int
    reading_minutes: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Goals ─────────────────────────────────────────────────────────────────────
class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    goal_type: str = "daily"
    category: Optional[str] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    current_value: Optional[float] = None
    completion_percent: Optional[float] = None
    is_completed: Optional[bool] = None
    completed_date: Optional[date] = None


class GoalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    goal_type: str
    category: Optional[str] = None
    target_value: Optional[float] = None
    current_value: float
    unit: Optional[str] = None
    completion_percent: float
    is_completed: bool
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    completed_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Planner ───────────────────────────────────────────────────────────────────
class PlannerTaskCreate(BaseModel):
    date: date
    title: str
    description: Optional[str] = None
    hour_slot: Optional[int] = None
    priority: str = "medium"
    category: Optional[str] = None


class PlannerTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    hour_slot: Optional[int] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None


class PlannerTaskResponse(BaseModel):
    id: int
    date: date
    title: str
    description: Optional[str] = None
    hour_slot: Optional[int] = None
    priority: str
    category: Optional[str] = None
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PlannerNoteCreate(BaseModel):
    date: date
    content: str


class PlannerNoteResponse(BaseModel):
    id: int
    date: date
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class PomodoroSessionCreate(BaseModel):
    date: date
    task_name: Optional[str] = None
    duration_minutes: int = 25
    completed: bool = True


class PomodoroSessionResponse(BaseModel):
    id: int
    date: date
    task_name: Optional[str] = None
    duration_minutes: int
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True
