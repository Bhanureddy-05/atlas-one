from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    theme: str = "dark"
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)
