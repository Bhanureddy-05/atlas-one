from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.study import StudySession
from app.models.dsa import DSATopic
from app.models.habit import HabitLog, Habit
from app.models.fitness import FitnessLog
from app.models.diet import FoodLog
from app.models.sleep import SleepLog
from app.models.goal import Goal
from app.auth import get_current_user

router = APIRouter()


def compute_report(user_id: int, start: date, end: date, db: Session):
    # Study hours
    study_hours = db.query(func.sum(StudySession.hours)).filter(
        StudySession.user_id == user_id,
        StudySession.date >= start,
        StudySession.date <= end,
    ).scalar() or 0.0

    # DSA solved
    dsa_topics = db.query(DSATopic).filter(DSATopic.user_id == user_id).all()
    total_solved = sum(t.easy_solved + t.medium_solved + t.hard_solved for t in dsa_topics)

    # Habit compliance
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    days = (end - start).days + 1
    expected = len(habits) * days
    completed = db.query(HabitLog).filter(
        HabitLog.user_id == user_id,
        HabitLog.date >= start,
        HabitLog.date <= end,
        HabitLog.completed == True,
    ).count() if habits else 0
    habit_compliance = round((completed / expected) * 100, 1) if expected > 0 else 0

    # Gym days
    gym_days = db.query(FitnessLog).filter(
        FitnessLog.user_id == user_id,
        FitnessLog.date >= start,
        FitnessLog.date <= end,
        FitnessLog.attended_gym == True,
    ).count()

    # Avg calories
    cal_rows = db.query(func.date(FoodLog.date), func.sum(FoodLog.calories)).filter(
        FoodLog.user_id == user_id,
        FoodLog.date >= start,
        FoodLog.date <= end,
    ).group_by(func.date(FoodLog.date)).all()
    avg_calories = round(sum(r[1] for r in cal_rows) / max(len(cal_rows), 1), 0) if cal_rows else 0

    # Avg sleep
    sleep_logs = db.query(SleepLog).filter(
        SleepLog.user_id == user_id,
        SleepLog.date >= start,
        SleepLog.date <= end,
    ).all()
    avg_sleep = round(sum(l.hours for l in sleep_logs if l.hours) / max(len(sleep_logs), 1), 1) if sleep_logs else 0

    # Goals achieved
    goals_achieved = db.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.is_completed == True,
        Goal.completed_date >= start,
        Goal.completed_date <= end,
    ).count()

    # Build strengths/weaknesses
    strengths = []
    weaknesses = []
    recommendations = []

    if habit_compliance >= 80:
        strengths.append(f"Excellent habit consistency: {habit_compliance}%")
    elif habit_compliance < 50:
        weaknesses.append(f"Low habit compliance: {habit_compliance}%")
        recommendations.append("Focus on completing at least 5 habits daily to build consistency.")

    if study_hours >= 20:
        strengths.append(f"Strong study commitment: {study_hours:.1f} hours")
    elif study_hours < 5:
        weaknesses.append(f"Low study hours: {study_hours:.1f} hours")
        recommendations.append("Aim for at least 2 hours of focused study per day.")

    if gym_days >= 4:
        strengths.append(f"Good gym attendance: {gym_days} days")
    elif gym_days < 2:
        weaknesses.append(f"Low gym attendance: {gym_days} days")
        recommendations.append("Try to hit the gym at least 4 times per week.")

    if avg_sleep >= 7:
        strengths.append(f"Healthy sleep average: {avg_sleep} hours")
    else:
        weaknesses.append(f"Insufficient sleep: {avg_sleep} hours average")
        recommendations.append("Prioritize 7-8 hours of sleep for better performance.")

    return {
        "period": {"start": str(start), "end": str(end)},
        "study_hours": round(study_hours, 1),
        "dsa_total_solved": total_solved,
        "habit_compliance_percent": habit_compliance,
        "gym_days": gym_days,
        "avg_daily_calories": avg_calories,
        "avg_sleep_hours": avg_sleep,
        "goals_achieved": goals_achieved,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
    }


@router.get("/weekly")
def weekly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    start = today - timedelta(days=6)
    return compute_report(current_user.id, start, today, db)


@router.get("/monthly")
def monthly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    start = today.replace(day=1)
    return compute_report(current_user.id, start, today, db)


@router.get("/yearly")
def yearly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    start = today.replace(month=1, day=1)
    return compute_report(current_user.id, start, today, db)
