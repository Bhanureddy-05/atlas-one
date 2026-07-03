from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# ── Study ──────────────────────────────────────────────────────────────────────
class StudyTopicCreate(BaseModel):
    name: str
    category: str
    notes: Optional[str] = None
    resources: Optional[str] = None
    target_date: Optional[date] = None


class StudyTopicUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    completion_percent: Optional[float] = None
    notes: Optional[str] = None
    resources: Optional[str] = None
    last_revised: Optional[date] = None
    target_date: Optional[date] = None


class StudyTopicResponse(BaseModel):
    id: int
    name: str
    category: str
    completion_percent: float
    total_hours: float
    notes: Optional[str] = None
    resources: Optional[str] = None
    last_revised: Optional[date] = None
    target_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StudySessionCreate(BaseModel):
    topic_id: int
    date: date
    hours: float
    notes: Optional[str] = None


class StudySessionResponse(BaseModel):
    id: int
    topic_id: int
    date: date
    hours: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── DSA ───────────────────────────────────────────────────────────────────────
class DSATopicCreate(BaseModel):
    name: str


class DSATopicUpdate(BaseModel):
    easy_solved: Optional[int] = None
    medium_solved: Optional[int] = None
    hard_solved: Optional[int] = None
    accuracy: Optional[float] = None
    notes: Optional[str] = None
    last_revised: Optional[date] = None


class DSATopicResponse(BaseModel):
    id: int
    name: str
    easy_solved: int
    medium_solved: int
    hard_solved: int
    accuracy: float
    notes: Optional[str] = None
    last_revised: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DSAProblemCreate(BaseModel):
    topic_id: int
    title: str
    difficulty: str
    leetcode_url: Optional[str] = None
    company_tags: Optional[str] = None
    notes: Optional[str] = None


class DSAProblemUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    solved_date: Optional[date] = None
    attempts: Optional[int] = None


class DSAProblemResponse(BaseModel):
    id: int
    topic_id: int
    title: str
    difficulty: str
    status: str
    leetcode_url: Optional[str] = None
    company_tags: Optional[str] = None
    notes: Optional[str] = None
    solved_date: Optional[date] = None
    attempts: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Interview ─────────────────────────────────────────────────────────────────
class InterviewTopicCreate(BaseModel):
    name: str
    category: str
    notes: Optional[str] = None


class InterviewTopicUpdate(BaseModel):
    completion_percent: Optional[float] = None
    confidence_rating: Optional[int] = None
    notes: Optional[str] = None
    last_practiced: Optional[date] = None


class InterviewTopicResponse(BaseModel):
    id: int
    name: str
    category: str
    completion_percent: float
    confidence_rating: int
    notes: Optional[str] = None
    last_practiced: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Project ───────────────────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    technology: Optional[str] = None
    github_url: Optional[str] = None
    documentation_url: Optional[str] = None
    start_date: Optional[date] = None
    target_completion: Optional[date] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technology: Optional[str] = None
    status: Optional[str] = None
    progress_percent: Optional[float] = None
    github_url: Optional[str] = None
    documentation_url: Optional[str] = None
    target_completion: Optional[date] = None
    completed_date: Optional[date] = None
    is_featured: Optional[bool] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    technology: Optional[str] = None
    status: str
    progress_percent: float
    github_url: Optional[str] = None
    documentation_url: Optional[str] = None
    start_date: Optional[date] = None
    target_completion: Optional[date] = None
    completed_date: Optional[date] = None
    is_featured: bool
    created_at: datetime

    class Config:
        from_attributes = True
