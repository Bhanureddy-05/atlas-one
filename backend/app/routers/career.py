from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.career import JobApplication, MastersPrep, UniversityShortlist
from app.auth import get_current_user

router = APIRouter()

# --- Job Application Schemas ---
class JobApplicationCreate(BaseModel):
    company: str
    role: str
    status: str
    date_applied: date
    notes: Optional[str] = None
    leetcode_progress: Optional[str] = None
    resume_version: Optional[str] = None

class JobApplicationResponse(BaseModel):
    id: int
    company: str
    role: str
    status: str
    date_applied: date
    notes: Optional[str]
    leetcode_progress: Optional[str]
    resume_version: Optional[str]

    class Config:
        from_attributes = True

# --- Masters Prep Schemas ---
class MastersPrepUpdate(BaseModel):
    ielts_score: Optional[float] = None
    gre_score: Optional[int] = None
    sop_status: Optional[str] = None
    lor_count: Optional[int] = None
    visa_status: Optional[str] = None
    loan_status: Optional[str] = None

class MastersPrepResponse(BaseModel):
    id: int
    ielts_score: Optional[float]
    gre_score: Optional[int]
    sop_status: Optional[str]
    lor_count: Optional[int]
    visa_status: Optional[str]
    loan_status: Optional[str]

    class Config:
        from_attributes = True

# --- University Shortlist Schemas ---
class UniversityCreate(BaseModel):
    university_name: str
    program: str
    deadline: Optional[date] = None
    status: Optional[str] = "shortlisted"

class UniversityResponse(BaseModel):
    id: int
    university_name: str
    program: str
    deadline: Optional[date]
    status: str

    class Config:
        from_attributes = True


# --- Placement / Job Applications Routes ---
@router.get("/jobs", response_model=List[JobApplicationResponse])
def get_job_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(JobApplication).filter(JobApplication.user_id == current_user.id).order_by(JobApplication.date_applied.desc()).all()

@router.post("/jobs", response_model=JobApplicationResponse, status_code=201)
def create_job_application(
    job_data: JobApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Award 10 XP for applying to a job
    current_user.xp += 10
    if current_user.xp >= current_user.level * 100:
        current_user.xp -= current_user.level * 100
        current_user.level += 1

    job = JobApplication(
        user_id=current_user.id,
        company=job_data.company,
        role=job_data.role,
        status=job_data.status,
        date_applied=job_data.date_applied,
        notes=job_data.notes,
        leetcode_progress=job_data.leetcode_progress,
        resume_version=job_data.resume_version
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.put("/jobs/{job_id}", response_model=JobApplicationResponse)
def update_job_status(
    job_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(JobApplication).filter(JobApplication.id == job_id, JobApplication.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job application not found")
    job.status = status
    db.commit()
    db.refresh(job)
    return job


# --- Master's Preparation Routes ---
@router.get("/masters", response_model=MastersPrepResponse)
def get_masters_prep(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prep = db.query(MastersPrep).filter(MastersPrep.user_id == current_user.id).first()
    if not prep:
        prep = MastersPrep(user_id=current_user.id)
        db.add(prep)
        db.commit()
        db.refresh(prep)
    return prep

@router.put("/masters", response_model=MastersPrepResponse)
def update_masters_prep(
    prep_data: MastersPrepUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prep = db.query(MastersPrep).filter(MastersPrep.user_id == current_user.id).first()
    if not prep:
        prep = MastersPrep(user_id=current_user.id)
        db.add(prep)
        
    for key, value in prep_data.model_dump(exclude_unset=True).items():
        setattr(prep, key, value)
        
    db.commit()
    db.refresh(prep)
    return prep


# --- University Shortlist Routes ---
@router.get("/universities", response_model=List[UniversityResponse])
def get_universities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UniversityShortlist).filter(UniversityShortlist.user_id == current_user.id).order_by(UniversityShortlist.created_at.desc()).all()

@router.post("/universities", response_model=UniversityResponse, status_code=201)
def add_university(
    univ_data: UniversityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    univ = UniversityShortlist(
        user_id=current_user.id,
        university_name=univ_data.university_name,
        program=univ_data.program,
        deadline=univ_data.deadline,
        status=univ_data.status
    )
    db.add(univ)
    db.commit()
    db.refresh(univ)
    return univ

@router.put("/universities/{univ_id}", response_model=UniversityResponse)
def update_university_status(
    univ_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    univ = db.query(UniversityShortlist).filter(UniversityShortlist.id == univ_id, UniversityShortlist.user_id == current_user.id).first()
    if not univ:
        raise HTTPException(status_code=404, detail="University shortlist entry not found")
    univ.status = status
    db.commit()
    db.refresh(univ)
    return univ
