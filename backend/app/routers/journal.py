from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.journal import JournalEntry
from app.auth import get_current_user

router = APIRouter()

class JournalCreate(BaseModel):
    date: date
    entry_type: str  # "morning", "night"
    mood: int
    gratitude_1: Optional[str] = None
    gratitude_2: Optional[str] = None
    gratitude_3: Optional[str] = None
    reflection: Optional[str] = None
    lessons_learned: Optional[str] = None

class JournalResponse(BaseModel):
    id: int
    date: date
    entry_type: str
    mood: int
    gratitude_1: Optional[str]
    gratitude_2: Optional[str]
    gratitude_3: Optional[str]
    reflection: Optional[str]
    lessons_learned: Optional[str]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[JournalResponse])
def get_journal_entries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id)
    if start_date:
        query = query.filter(JournalEntry.date >= start_date)
    if end_date:
        query = query.filter(JournalEntry.date <= end_date)
    return query.order_by(JournalEntry.date.desc()).all()

@router.post("/", response_model=JournalResponse, status_code=201)
def create_journal_entry(
    entry_data: JournalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Award XP for journaling (15 XP per journal)
    current_user.xp += 15
    if current_user.xp >= current_user.level * 100:
        current_user.xp -= current_user.level * 100
        current_user.level += 1
        
    entry = JournalEntry(
        user_id=current_user.id,
        date=entry_data.date,
        entry_type=entry_data.entry_type,
        mood=entry_data.mood,
        gratitude_1=entry_data.gratitude_1,
        gratitude_2=entry_data.gratitude_2,
        gratitude_3=entry_data.gratitude_3,
        reflection=entry_data.reflection,
        lessons_learned=entry_data.lessons_learned
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
