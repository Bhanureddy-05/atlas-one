from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.study import StudyTopic, StudySession
from app.schemas.study import (
    StudyTopicCreate, StudyTopicUpdate, StudyTopicResponse,
    StudySessionCreate, StudySessionResponse,
)
from app.auth import get_current_user

router = APIRouter()


@router.get("/topics", response_model=List[StudyTopicResponse])
def get_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(StudyTopic).filter(StudyTopic.user_id == current_user.id).all()


@router.post("/topics", response_model=StudyTopicResponse, status_code=201)
def create_topic(
    data: StudyTopicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = StudyTopic(**data.model_dump(), user_id=current_user.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.put("/topics/{topic_id}", response_model=StudyTopicResponse)
def update_topic(
    topic_id: int,
    data: StudyTopicUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = db.query(StudyTopic).filter(
        StudyTopic.id == topic_id, StudyTopic.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(topic, k, v)
    db.commit()
    db.refresh(topic)
    return topic


@router.delete("/topics/{topic_id}")
def delete_topic(
    topic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = db.query(StudyTopic).filter(
        StudyTopic.id == topic_id, StudyTopic.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    return {"message": "Topic deleted"}


@router.get("/sessions", response_model=List[StudySessionResponse])
def get_sessions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    topic_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(StudySession).filter(StudySession.user_id == current_user.id)
    if start_date:
        query = query.filter(StudySession.date >= start_date)
    if end_date:
        query = query.filter(StudySession.date <= end_date)
    if topic_id:
        query = query.filter(StudySession.topic_id == topic_id)
    return query.order_by(StudySession.date.desc()).all()


@router.post("/sessions", response_model=StudySessionResponse, status_code=201)
def create_session(
    data: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = db.query(StudyTopic).filter(
        StudyTopic.id == data.topic_id, StudyTopic.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    session = StudySession(**data.model_dump(), user_id=current_user.id)
    db.add(session)
    # Update total hours
    topic.total_hours = (topic.total_hours or 0) + data.hours
    db.commit()
    db.refresh(session)
    return session
