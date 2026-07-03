from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate, ChangePassword
from app.models.user import User
from app.auth import get_current_user, get_password_hash, verify_password

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
