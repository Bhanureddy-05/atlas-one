from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.dsa import DSATopic, DSAProblem
from app.schemas.study import (
    DSATopicCreate, DSATopicUpdate, DSATopicResponse,
    DSAProblemCreate, DSAProblemUpdate, DSAProblemResponse,
)
from app.auth import get_current_user

router = APIRouter()


@router.get("/topics", response_model=List[DSATopicResponse])
def get_dsa_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(DSATopic).filter(DSATopic.user_id == current_user.id).all()


@router.post("/topics", response_model=DSATopicResponse, status_code=201)
def create_dsa_topic(
    data: DSATopicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = DSATopic(**data.model_dump(), user_id=current_user.id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@router.put("/topics/{topic_id}", response_model=DSATopicResponse)
def update_dsa_topic(
    topic_id: int,
    data: DSATopicUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = db.query(DSATopic).filter(
        DSATopic.id == topic_id, DSATopic.user_id == current_user.id
    ).first()
    if not topic:
        raise HTTPException(status_code=404, detail="DSA Topic not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(topic, k, v)
    db.commit()
    db.refresh(topic)
    return topic


@router.get("/problems", response_model=List[DSAProblemResponse])
def get_problems(
    topic_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(DSAProblem).filter(DSAProblem.user_id == current_user.id)
    if topic_id:
        query = query.filter(DSAProblem.topic_id == topic_id)
    if difficulty:
        query = query.filter(DSAProblem.difficulty == difficulty)
    if status:
        query = query.filter(DSAProblem.status == status)
    return query.all()


@router.post("/problems", response_model=DSAProblemResponse, status_code=201)
def create_problem(
    data: DSAProblemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    problem = DSAProblem(**data.model_dump(), user_id=current_user.id)
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


@router.put("/problems/{problem_id}", response_model=DSAProblemResponse)
def update_problem(
    problem_id: int,
    data: DSAProblemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    problem = db.query(DSAProblem).filter(
        DSAProblem.id == problem_id, DSAProblem.user_id == current_user.id
    ).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(problem, k, v)
    # If marking as solved, update topic counts
    if data.status == "solved":
        topic = db.query(DSATopic).filter(DSATopic.id == problem.topic_id).first()
        if topic and problem.difficulty == "easy":
            topic.easy_solved += 1
        elif topic and problem.difficulty == "medium":
            topic.medium_solved += 1
        elif topic and problem.difficulty == "hard":
            topic.hard_solved += 1
    db.commit()
    db.refresh(problem)
    return problem


@router.get("/stats")
def get_dsa_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topics = db.query(DSATopic).filter(DSATopic.user_id == current_user.id).all()
    total_easy = sum(t.easy_solved for t in topics)
    total_medium = sum(t.medium_solved for t in topics)
    total_hard = sum(t.hard_solved for t in topics)
    total = total_easy + total_medium + total_hard

    return {
        "total_solved": total,
        "easy_solved": total_easy,
        "medium_solved": total_medium,
        "hard_solved": total_hard,
        "topics_count": len(topics),
        "by_topic": [
            {
                "name": t.name,
                "easy": t.easy_solved,
                "medium": t.medium_solved,
                "hard": t.hard_solved,
                "total": t.easy_solved + t.medium_solved + t.hard_solved,
            }
            for t in topics
        ],
    }
