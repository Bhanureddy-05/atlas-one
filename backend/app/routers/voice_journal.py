import os
import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.voice_journal import VoiceJournal
from app.auth import get_current_user

router = APIRouter()

# Directory for storing audio uploads
UPLOAD_DIR = os.path.join("uploads", "voice")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class VoiceJournalResponse(BaseModel):
    id: int
    date: date
    audio_path: Optional[str]
    transcript: str
    ai_summary: Optional[str]
    mood: Optional[str]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[VoiceJournalResponse])
def get_voice_journals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(VoiceJournal).filter(VoiceJournal.user_id == current_user.id).order_by(VoiceJournal.created_at.desc()).all()

@router.post("/", response_model=VoiceJournalResponse, status_code=201)
async def upload_voice_journal(
    transcript: str = Form(...),
    date_str: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine date
    log_date = date.today()
    if date_str:
        try:
            log_date = date.fromisoformat(date_str)
        except ValueError:
            pass

    # Save audio file if provided
    file_path = None
    if file:
        file_ext = os.path.splitext(file.filename)[1] or ".webm"
        file_name = f"{uuid.uuid4()}{file_ext}"
        dest_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(dest_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        file_path = f"/api/voice-journal/audio/{file_name}"

    # Auto-generate local AI summary and simple mock mood detection
    summary = f"Voice journal log: transcribed {len(transcript.split())} words. Highlights: {transcript[:80]}..."
    
    # Mock mood detection based on keywords
    mood = "Neutral 😐"
    t_lower = transcript.lower()
    if any(w in t_lower for w in ["happy", "great", "awesome", "excited", "love", "productive"]):
        mood = "Positive 😊"
    elif any(w in t_lower for w in ["tired", "exhausted", "lazy", "slow", "stressed", "burnout"]):
        mood = "Tired 🥱"
    elif any(w in t_lower for w in ["sad", "failed", "unhappy", "angry", "annoyed"]):
        mood = "Negative 😔"

    # Add XP for voice journaling
    current_user.xp += 15
    if current_user.xp >= current_user.level * 100:
        current_user.xp -= current_user.level * 100
        current_user.level += 1

    db_journal = VoiceJournal(
        user_id=current_user.id,
        date=log_date,
        audio_path=file_path,
        transcript=transcript,
        ai_summary=summary,
        mood=mood
    )
    db.add(db_journal)
    db.commit()
    db.refresh(db_journal)
    return db_journal

# Fetch audio files
from fastapi.responses import FileResponse

@router.get("/audio/{filename}")
def get_audio_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path)
