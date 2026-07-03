from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.database import get_db
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.models.study import StudySession
from app.models.fitness import FitnessLog, BodyMeasurement
from app.models.diet import FoodLog
from app.models.sleep import SleepLog
from app.models.goal import Goal
from app.models.dsa import DSAProblem
from app.auth import get_current_user
from typing import Dict, Any

router = APIRouter()

MOTIVATIONAL_QUOTES = [
    "The secret of getting ahead is getting started. – Mark Twain",
    "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Push yourself, because no one else is going to do it for you.",
    "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
    "Your future is created by what you do today, not tomorrow.",
    "Dream big. Start small. Act now.",
    "You don't have to be great to start, but you have to start to be great.",
]


@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # Today's study hours
    today_study = db.query(func.sum(StudySession.hours)).filter(
        StudySession.user_id == current_user.id,
        StudySession.date == today,
    ).scalar() or 0.0

    # This week study hours
    week_study = db.query(func.sum(StudySession.hours)).filter(
        StudySession.user_id == current_user.id,
        StudySession.date >= week_ago,
    ).scalar() or 0.0

    # Today's calories
    today_calories = db.query(func.sum(FoodLog.calories)).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.date == today,
    ).scalar() or 0.0

    # Latest weight
    latest_weight = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id,
    ).order_by(BodyMeasurement.date.desc()).first()

    # Today's sleep
    today_sleep = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id,
        SleepLog.date == today,
    ).first()

    # Habits today
    habits = db.query(Habit).filter(
        Habit.user_id == current_user.id,
        Habit.is_active == True,
    ).all()
    completed_habits = db.query(HabitLog).filter(
        HabitLog.user_id == current_user.id,
        HabitLog.date == today,
        HabitLog.completed == True,
    ).count()
    total_habits = len(habits)

    # Habit consistency (last 30 days)
    if total_habits > 0 and month_ago:
        expected = total_habits * 30
        actual = db.query(HabitLog).filter(
            HabitLog.user_id == current_user.id,
            HabitLog.date >= month_ago,
            HabitLog.completed == True,
        ).count()
        consistency = round((actual / expected) * 100, 1) if expected > 0 else 0
    else:
        consistency = 0

    # Goals
    daily_goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.goal_type == "daily",
        Goal.is_completed == False,
    ).all()

    # Longest streak across habits
    max_streak = max((h.streak for h in habits), default=0)

    # Weekly study data (last 7 days)
    weekly_study = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        hours = db.query(func.sum(StudySession.hours)).filter(
            StudySession.user_id == current_user.id,
            StudySession.date == d,
        ).scalar() or 0.0
        weekly_study.append({"date": str(d), "hours": round(hours, 1)})

    # Recent fitness
    recent_fitness = db.query(FitnessLog).filter(
        FitnessLog.user_id == current_user.id,
    ).order_by(FitnessLog.date.desc()).limit(7).all()
    gym_days = sum(1 for f in recent_fitness if f.attended_gym)

    # Today's Water & DSA Solved
    today_water = db.query(func.sum(FoodLog.water_ml)).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.date == today,
    ).scalar() or 0.0

    dsa_solved_today = db.query(DSAProblem).filter(
        DSAProblem.user_id == current_user.id,
        DSAProblem.solved_date == today,
        DSAProblem.status == "solved"
    ).count()

    total_dsa_solved = db.query(DSAProblem).filter(
        DSAProblem.user_id == current_user.id,
        DSAProblem.status == "solved"
    ).count()

    # Masters preparation metrics
    from app.models.career import MastersPrep
    prep = db.query(MastersPrep).filter(MastersPrep.user_id == current_user.id).first()
    
    # Calculate Readiness Scores
    sop_w = 30 if prep and prep.sop_status == "completed" else 15
    lor_w = min((prep.lor_count if prep else 0) * 15, 30)
    ielts_w = 20 if prep and prep.ielts_score else 0
    gre_w = 20 if prep and prep.gre_score else 0
    masters_readiness = sop_w + lor_w + ielts_w + gre_w
    
    placement_readiness = min(round((total_dsa_solved / 20.0) * 100), 100)

    # 1. Today's sleep values
    sleep_h = today_sleep.hours if today_sleep and today_sleep.hours else 7.0
    sleep_q = today_sleep.quality if today_sleep and today_sleep.quality else 3.0

    # 2. Score calculations
    today_score = int((completed_habits / total_habits) * 100) if total_habits > 0 else 85
    discipline_score = int((consistency * 0.6) + min((max_streak / 7.0) * 40, 40))
    focus_score = int(min((today_study / 6.0) * 70, 70) + (30 if dsa_solved_today > 0 else 10))
    health_score = int((sleep_q / 5.0) * 40 + min((today_water / 2500) * 40, 40) + (20 if gym_days > 0 else 10))
    learning_score = int(min((week_study / 25.0) * 60, 60) + min((total_dsa_solved / 15.0) * 40, 40))
    life_score = int((discipline_score * 0.3) + (focus_score * 0.25) + (health_score * 0.25) + (learning_score * 0.2))
    
    energy_level = int(min(((sleep_h * (sleep_q / 5.0)) / 8.0) * 100, 100)) if sleep_h > 0 else 60
    recovery_score = int(sleep_q * 20) if sleep_q > 0 else 65

    # Today's quote (deterministic based on day of year)
    quote = MOTIVATIONAL_QUOTES[today.timetuple().tm_yday % len(MOTIVATIONAL_QUOTES)]

    return {
        "user": {
            "name": current_user.full_name, 
            "username": current_user.username,
            "level": current_user.level,
            "xp": current_user.xp,
            "streak_shields": current_user.streak_shields
        },
        "today": str(today),
        "today_study_hours": round(today_study, 1),
        "week_study_hours": round(week_study, 1),
        "today_calories": round(today_calories),
        "latest_weight": latest_weight.weight_kg if latest_weight else None,
        "sleep_hours": today_sleep.hours if today_sleep else None,
        "sleep_quality": today_sleep.quality if today_sleep else None,
        "habits_completed": completed_habits,
        "habits_total": total_habits,
        "habit_consistency_percent": consistency,
        "current_streak": max_streak,
        "daily_goals": [{"id": g.id, "title": g.title, "is_completed": g.is_completed} for g in daily_goals],
        "weekly_study_data": weekly_study,
        "gym_days_this_week": gym_days,
        "motivational_quote": quote,
        
        # LifeOS Infinity Dynamic Indicators
        "today_score": today_score,
        "life_score": life_score,
        "discipline_score": discipline_score,
        "focus_score": focus_score,
        "health_score": health_score,
        "learning_score": learning_score,
        "energy_level": energy_level,
        "recovery_score": recovery_score,
        "today_water_ml": today_water,
        "placement_readiness": placement_readiness,
        "masters_readiness": masters_readiness
    }
