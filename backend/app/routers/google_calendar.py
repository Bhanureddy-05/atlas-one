from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.google_calendar import GoogleCalendarCredential
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

# --- OAuth Payload Schemas ---
class CalendarSyncRequest(BaseModel):
    auth_code: str

class CalendarEventResponse(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    category: str

@router.get("/status")
def get_calendar_link_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if the user's account is linked to Google Calendar OAuth credentials."""
    cred = db.query(GoogleCalendarCredential).filter(GoogleCalendarCredential.user_id == current_user.id).first()
    
    # Check if credentials are set in environment
    client_id_configured = hasattr(settings, "GOOGLE_CLIENT_ID") and settings.GOOGLE_CLIENT_ID is not None
    
    return {
        "linked": cred is not None,
        "expires_at": cred.expires_at.isoformat() if cred else None,
        "config_ready": client_id_configured,
        "client_id": settings.GOOGLE_CLIENT_ID if client_id_configured else "PENDING_CONFIG_IN_ENV",
        "instructions": (
            "To connect your Google Calendar: "
            "1. Register a web application credentials key in Google Cloud Console. "
            "2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment parameters in backend backend/app/config.py. "
            "3. Link the OAuth workflow redirect URI to: http://localhost:5173/calendar/callback."
        )
    }

@router.post("/link")
def link_google_calendar(
    payload: CalendarSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Simulate OAuth exchange from frontend authorization code to access token."""
    if not payload.auth_code:
        raise HTTPException(status_code=400, detail="Invalid authorization code")
        
    # Save mock tokens for local SQLite database representation
    # In a full configuration, this makes a POST request to https://oauth2.googleapis.com/token
    expires = datetime.utcnow() + timedelta(hours=1)
    
    existing_cred = db.query(GoogleCalendarCredential).filter(GoogleCalendarCredential.user_id == current_user.id).first()
    if not existing_cred:
        existing_cred = GoogleCalendarCredential(
            user_id=current_user.id,
            access_token="mock_access_token_google_calendar",
            refresh_token="mock_refresh_token_google_calendar",
            expires_at=expires
        )
        db.add(existing_cred)
    else:
        existing_cred.access_token = "mock_access_token_google_calendar"
        existing_cred.expires_at = expires
        
    db.commit()
    db.refresh(existing_cred)
    return {"message": "Google Calendar linked successfully!", "linked": True}

@router.get("/events", response_model=List[CalendarEventResponse])
def get_calendar_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve upcoming events. Returns mock synchronized entries if linked, else empty array."""
    cred = db.query(GoogleCalendarCredential).filter(GoogleCalendarCredential.user_id == current_user.id).first()
    if not cred:
        return []
        
    # Generate high-fidelity synchronized Google Calendar events
    today = datetime.now()
    return [
        {
            "id": "gc_event_1",
            "title": "📋 MS Application LOR Review",
            "start_time": (today + timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M:00"),
            "end_time": (today + timedelta(hours=3)).strftime("%Y-%m-%dT%H:%M:00"),
            "category": "academic"
        },
        {
            "id": "gc_event_2",
            "title": "🎙️ Mock Technical Interview (NVIDIA Mock)",
            "start_time": (today + timedelta(days=1, hours=10)).strftime("%Y-%m-%dT10:00:00"),
            "end_time": (today + timedelta(days=1, hours=11)).strftime("%Y-%m-%dT11:00:00"),
            "category": "career"
        },
        {
            "id": "gc_event_3",
            "title": "👨‍⚕️ Annual Body Health Checkup",
            "start_time": (today + timedelta(days=3, hours=14)).strftime("%Y-%m-%dT14:00:00"),
            "end_time": (today + timedelta(days=3, hours=15)).strftime("%Y-%m-%dT15:00:00"),
            "category": "health"
        }
    ]

@router.delete("/unlink")
def unlink_google_calendar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove Google Calendar credentials from database."""
    cred = db.query(GoogleCalendarCredential).filter(GoogleCalendarCredential.user_id == current_user.id).first()
    if cred:
        db.delete(cred)
        db.commit()
    return {"message": "Google Calendar unlinked successfully!", "linked": False}

