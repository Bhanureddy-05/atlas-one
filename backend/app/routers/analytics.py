from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.study import StudySession, StudyTopic
from app.models.dsa import DSATopic
from app.models.habit import HabitLog, Habit
from app.models.diet import FoodLog
from app.models.fitness import FitnessLog, BodyMeasurement
from app.models.sleep import SleepLog
from app.models.singing import SingingSession
from app.models.reading import ReadingSession
from app.auth import get_current_user

router = APIRouter()


@router.get("/overview")
def get_analytics_overview(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    start = today - timedelta(days=days)

    # Daily study hours (Optimized: single query instead of N queries)
    study_sessions = db.query(
        StudySession.date,
        func.sum(StudySession.hours).label("hours")
    ).filter(
        StudySession.user_id == current_user.id,
        StudySession.date >= start,
        StudySession.date <= today,
    ).group_by(StudySession.date).all()
    study_map = {row.date: row.hours for row in study_sessions}

    study_data = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        hours = study_map.get(d, 0.0) or 0.0
        study_data.append({"date": str(d), "hours": round(hours, 1)})

    # DSA stats
    dsa_topics = db.query(DSATopic).filter(DSATopic.user_id == current_user.id).all()
    dsa_by_topic = [
        {
            "topic": t.name,
            "easy": t.easy_solved,
            "medium": t.medium_solved,
            "hard": t.hard_solved,
            "total": t.easy_solved + t.medium_solved + t.hard_solved,
        }
        for t in dsa_topics
    ]

    # Calorie data (Optimized: single query instead of 2N queries)
    food_logs = db.query(
        FoodLog.date,
        func.sum(FoodLog.calories).label("calories"),
        func.sum(FoodLog.protein_g).label("protein")
    ).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.date >= start,
        FoodLog.date <= today,
    ).group_by(FoodLog.date).all()
    food_map = {row.date: (row.calories or 0.0, row.protein or 0.0) for row in food_logs}

    calorie_data = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        cals, protein = food_map.get(d, (0.0, 0.0))
        calorie_data.append({"date": str(d), "calories": round(cals), "protein": round(protein, 1)})

    # Weight history
    weight_history = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id,
        BodyMeasurement.date >= start,
    ).order_by(BodyMeasurement.date.asc()).all()
    weight_data = [{"date": str(m.date), "weight": m.weight_kg} for m in weight_history]

    # Habit consistency (Optimized: single query instead of N queries)
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id, Habit.is_active == True
    ).all()
    habit_ids = [h.id for h in habits]
    
    completed_logs = db.query(
        HabitLog.habit_id,
        func.count(HabitLog.id).label("count")
    ).filter(
        HabitLog.habit_id.in_(habit_ids),
        HabitLog.date >= start,
        HabitLog.completed == True
    ).group_by(HabitLog.habit_id).all() if habit_ids else []
    completed_map = {row.habit_id: row.count for row in completed_logs}

    habit_consistency = []
    for habit in habits:
        logs_in_period = completed_map.get(habit.id, 0)
        habit_consistency.append({
            "name": habit.name,
            "completed": logs_in_period,
            "possible": days,
            "percent": round((logs_in_period / days) * 100, 1),
        })

    # Sleep data
    sleep_logs = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id,
        SleepLog.date >= start,
    ).order_by(SleepLog.date.asc()).all()
    sleep_data = [{"date": str(l.date), "hours": l.hours, "quality": l.quality} for l in sleep_logs]

    # Singing
    singing_sessions = db.query(SingingSession).filter(
        SingingSession.user_id == current_user.id,
        SingingSession.date >= start,
    ).order_by(SingingSession.date.asc()).all()
    singing_data = [{"date": str(s.date), "minutes": s.practice_minutes} for s in singing_sessions]

    # Reading
    reading_sessions = db.query(ReadingSession).filter(
        ReadingSession.user_id == current_user.id,
        ReadingSession.date >= start,
    ).order_by(ReadingSession.date.asc()).all()
    reading_data = [{"date": str(s.date), "pages": s.pages_read, "minutes": s.reading_minutes} for s in reading_sessions]

    # Study by topic
    study_topics = db.query(StudyTopic).filter(StudyTopic.user_id == current_user.id).all()
    study_by_topic = [
        {"name": t.name, "hours": t.total_hours, "completion": t.completion_percent}
        for t in study_topics
    ]

    return {
        "study_data": study_data,
        "dsa_by_topic": dsa_by_topic,
        "calorie_data": calorie_data,
        "weight_data": weight_data,
        "habit_consistency": habit_consistency,
        "sleep_data": sleep_data,
        "singing_data": singing_data,
        "reading_data": reading_data,
        "study_by_topic": study_by_topic,
    }
