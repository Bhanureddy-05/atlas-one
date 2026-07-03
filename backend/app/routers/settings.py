from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_settings(current_user: User = Depends(get_current_user)):
    return {
        "theme": current_user.theme,
        "notifications": True,
        "email": current_user.email,
        "username": current_user.username,
    }


@router.put("/theme")
def update_theme(
    theme: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.theme = theme
    db.commit()
    return {"theme": current_user.theme}
