import os
import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.responses import FileResponse

from app.database import get_db
from app.models.user import User
from app.models.progress_photo import ProgressPhoto
from app.auth import get_current_user

router = APIRouter()

# Directory for progress pictures
UPLOAD_DIR = os.path.join("uploads", "photos")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ProgressPhotoResponse(BaseModel):
    id: int
    date: date
    photo_path: str
    weight_kg: Optional[float]
    notes: Optional[str]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProgressPhotoResponse])
def get_progress_photos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ProgressPhoto).filter(ProgressPhoto.user_id == current_user.id).order_by(ProgressPhoto.date.desc()).all()

@router.post("/", response_model=ProgressPhotoResponse, status_code=201)
async def upload_progress_photo(
    file: UploadFile = File(...),
    weight_kg: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    date_str: Optional[str] = Form(None),
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

    # Save photo file
    file_ext = os.path.splitext(file.filename)[1] or ".jpg"
    file_name = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(dest_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    photo_url = f"/api/progress-photo/image/{file_name}"

    # Award 10 XP for updating progress photo
    current_user.xp += 10
    if current_user.xp >= current_user.level * 100:
        current_user.xp -= current_user.level * 100
        current_user.level += 1

    db_photo = ProgressPhoto(
        user_id=current_user.id,
        date=log_date,
        photo_path=photo_url,
        weight_kg=weight_kg,
        notes=notes
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

@router.get("/image/{filename}")
def get_photo_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Photo file not found")
    return FileResponse(file_path)
