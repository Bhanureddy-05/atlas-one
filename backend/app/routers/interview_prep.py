from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.interview import InterviewTopic, InterviewSession
from app.schemas.study import InterviewTopicCreate, InterviewTopicUpdate, InterviewTopicResponse
from app.auth import get_current_user

router = APIRouter()


@router.get("/topics", response_model=List[InterviewTopicResponse])
def get_topics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(InterviewTopic).filter(InterviewTopic.user_id == current_user.id).all()


@router.post("/topics", response_model=InterviewTopicResponse, status_code=201)
def create_topic(
    data: InterviewTopicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = InterviewTopic(**data.model_dump(), user_id=current_user.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.put("/topics/{topic_id}", response_model=InterviewTopicResponse)
def update_topic(
    topic_id: int,
    data: InterviewTopicUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = db.query(InterviewTopic).filter(
        InterviewTopic.id == topic_id, InterviewTopic.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(topic, k, v)
    db.commit()
    db.refresh(topic)
    return topic


@router.get("/readiness")
def get_readiness(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topics = db.query(InterviewTopic).filter(InterviewTopic.user_id == current_user.id).all()
    if not topics:
        return {"overall_readiness": 0, "by_category": {}}
    avg = sum(t.completion_percent for t in topics) / len(topics)
    by_cat = {}
    for t in topics:
        if t.category not in by_cat:
            by_cat[t.category] = []
        by_cat[t.category].append(t.completion_percent)
    by_cat = {k: round(sum(v) / len(v), 1) for k, v in by_cat.items()}
    return {"overall_readiness": round(avg, 1), "by_category": by_cat}
