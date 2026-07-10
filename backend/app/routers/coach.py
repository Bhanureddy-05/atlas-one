from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.habit import HabitLog
from app.models.study import StudySession
from app.models.dsa import DSAProblem
from app.models.fitness import FitnessLog, BodyMeasurement
from app.models.diet import FoodLog
from app.models.sleep import SleepLog
from app.models.reading import ReadingSession
from app.models.goal import Goal
from app.auth import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = None

@router.get("/insights")
def get_coach_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze database logs to generate custom, context-aware AI coaching recommendations."""
    user_id = current_user.id
    today = date.today()
    
    # Time window limits
    seven_days_ago = today - timedelta(days=7)
    fourteen_days_ago = today - timedelta(days=14)
    
    insights = []
    strengths = []
    recommendations = []
    
    # 1. ── SLEEP ANALYSIS ──────────────────────────────────────────────────
    sleep_recent = db.query(SleepLog).filter(SleepLog.user_id == user_id, SleepLog.date >= seven_days_ago).all()
    sleep_prev = db.query(SleepLog).filter(SleepLog.user_id == user_id, SleepLog.date >= fourteen_days_ago, SleepLog.date < seven_days_ago).all()
    
    avg_sleep_recent = sum(s.hours for s in sleep_recent) / len(sleep_recent) if sleep_recent else 0.0
    avg_sleep_prev = sum(s.hours for s in sleep_prev) / len(sleep_prev) if sleep_prev else 0.0
    
    if avg_sleep_recent > 0:
        if avg_sleep_recent < 6.5:
            recommendations.append(f"Sleep duration averaged {avg_sleep_recent:.1f}h this week, which is below the healthy threshold. Prioritize sleep before 10 PM.")
        elif avg_sleep_recent >= 7.5:
            strengths.append(f"Great sleep hygiene! You averaged {avg_sleep_recent:.1f} hours of sleep daily this week.")
            
        if avg_sleep_prev > 0 and avg_sleep_recent < avg_sleep_prev - 0.7:
            insights.append(f"Sleep decreased significantly compared to last week (dropped from {avg_sleep_prev:.1f}h to {avg_sleep_recent:.1f}h).")
            
        # Check average quality
        avg_quality = sum(s.quality for s in sleep_recent) / len(sleep_recent)
        if avg_quality < 3.0:
            recommendations.append("Your sleep quality rating is low. Consider avoiding screens and caffeine at least 2 hours before bed.")
            
    # 2. ── DIET & NUTRITION ANALYSIS ───────────────────────────────────────
    diet_recent = db.query(FoodLog).filter(FoodLog.user_id == user_id, FoodLog.date >= seven_days_ago).all()
    
    # Find user weight for protein calculations
    latest_measurement = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == user_id).order_by(BodyMeasurement.date.desc()).first()
    weight = latest_measurement.weight_kg if latest_measurement and latest_measurement.weight_kg else 70.0
    
    if diet_recent:
        # Group by date to get daily averages
        daily_nutrition = {}
        for fd in diet_recent:
            d_str = fd.date.isoformat()
            if d_str not in daily_nutrition:
                daily_nutrition[d_str] = {"calories": 0.0, "protein": 0.0, "water": 0.0}
            daily_nutrition[d_str]["calories"] += fd.calories
            daily_nutrition[d_str]["protein"] += fd.protein_g
            daily_nutrition[d_str]["water"] += fd.water_ml
            
        num_days = len(daily_nutrition)
        avg_protein = sum(d["protein"] for d in daily_nutrition.values()) / num_days
        avg_water = sum(d["water"] for d in daily_nutrition.values()) / num_days
        avg_calories = sum(d["calories"] for d in daily_nutrition.values()) / num_days
        
        target_protein = weight * 1.6 # 1.6g per kg of bodyweight
        
        if avg_protein < target_protein:
            recommendations.append(f"Protein intake is low (averaged {avg_protein:.1f}g/day, target is {target_protein:.0f}g based on your weight). Boost intake of eggs, poultry, lentils, or whey.")
        else:
            strengths.append(f"Protein goals met! Averaging {avg_protein:.1f}g per day, supporting muscle recovery.")
            
        if avg_water < 2200:
            recommendations.append(f"Hydration is below optimal. You averaged {avg_water:.0f}ml water daily. Aim for at least 2,500ml.")
        else:
            strengths.append("Excellent hydration! You are consistently hitting your water target.")
            
    # 3. ── STUDY & PRODUCTIVITY ANALYSIS ───────────────────────────────────
    study_recent = db.query(StudySession).filter(StudySession.user_id == user_id, StudySession.date >= seven_days_ago).all()
    study_prev = db.query(StudySession).filter(StudySession.user_id == user_id, StudySession.date >= fourteen_days_ago, StudySession.date < seven_days_ago).all()
    
    total_hours_recent = sum(ss.hours for ss in study_recent)
    total_hours_prev = sum(ss.hours for ss in study_prev)
    
    if total_hours_recent > 0:
        if total_hours_prev > 0:
            if total_hours_recent < total_hours_prev * 0.7:
                insights.append(f"Study consistency dropped. Focused study hours fell from {total_hours_prev:.1f}h last week to {total_hours_recent:.1f}h this week.")
                recommendations.append("Re-engage with your studies. Try scheduling short 25-minute Pomodoro sessions to rebuild momentum.")
            elif total_hours_recent > total_hours_prev * 1.2:
                strengths.append(f"Excellent focus! Study time increased by {((total_hours_recent - total_hours_prev)/total_hours_prev)*100:.0f}% compared to last week.")
        else:
            strengths.append(f"You logged {total_hours_recent:.1f} hours of data science studies this week.")
            
    # 4. ── DSA PRACTICE ────────────────────────────────────────────────────
    dsa_solved_recent = db.query(DSAProblem).filter(
        DSAProblem.user_id == user_id,
        DSAProblem.solved_date >= seven_days_ago,
        DSAProblem.status == "solved"
    ).all()
    
    if len(dsa_solved_recent) >= 4:
        strengths.append(f"Fantastic DSA discipline! You solved {len(dsa_solved_recent)} problems on LeetCode this week.")
    elif len(dsa_solved_recent) == 0:
        recommendations.append("DSA consistency is lacking. Try to solve at least 2 easy problems per week to stay sharp on algorithms.")
        
    # 5. ── HABIT CONSISTENCY ───────────────────────────────────────────────
    logs_recent = db.query(HabitLog).filter(HabitLog.user_id == user_id, HabitLog.date >= seven_days_ago).all()
    if logs_recent:
        completed_count = sum(1 for log in logs_recent if log.completed)
        consistency = (completed_count / len(logs_recent)) * 100
        if consistency < 65:
            recommendations.append(f"Habit consistency dropped to {consistency:.0f}% this week. Focus on core daily routines like waking early and gym.")
        elif consistency >= 80:
            strengths.append(f"Outstanding discipline! Your overall habit completion consistency is at {consistency:.0f}%.")
 
    # 6. ── READING HABITS ──────────────────────────────────────────────────
    reading_recent = db.query(ReadingSession).filter(ReadingSession.user_id == user_id, ReadingSession.date >= seven_days_ago).all()
    reading_prev = db.query(ReadingSession).filter(ReadingSession.user_id == user_id, ReadingSession.date >= fourteen_days_ago, ReadingSession.date < seven_days_ago).all()
    
    pages_recent = sum(rs.pages_read for rs in reading_recent)
    pages_prev = sum(rs.pages_read for rs in reading_prev)
    
    if pages_recent > 0:
        if pages_prev > 0 and pages_recent > pages_prev * 1.1:
            strengths.append(f"Reading improved! You read {pages_recent} pages this week vs {pages_prev} pages last week.")
        elif pages_recent < 20:
            recommendations.append("Reading has slowed down. Carve out just 10 minutes before bed to read a few pages.")
 
    # 7. ── FITNESS & BODY WEIGHT TRENDS ────────────────────────────────────
    workout_recent = db.query(FitnessLog).filter(FitnessLog.user_id == user_id, FitnessLog.date >= seven_days_ago).all()
    workout_prev = db.query(FitnessLog).filter(FitnessLog.user_id == user_id, FitnessLog.date >= fourteen_days_ago, FitnessLog.date < seven_days_ago).all()
    
    if len(workout_recent) > len(workout_prev) and len(workout_recent) >= 3:
        strengths.append(f"Workout frequency increased! You hit the gym {len(workout_recent)} times this week.")
    elif len(workout_recent) < 2:
        recommendations.append("Physical activity was low this week. Aim for at least 3 strength or cardio sessions to maintain mobility and physical fitness.")
        
    # Generate generic greeting / quote if lists are empty
    if not insights and not strengths and not recommendations:
        insights.append("Your dashboard logs are clean. Add more daily logs across diet, study, and habits to unlock deep AI Coaching suggestions.")
        recommendations.append("Start tracking study sessions and daily food intake to get tailored nutritional and productivity coaching.")
 
    return {
        "coach_name": "Atlas One AI Advisor",
        "generated_at": datetime.utcnow().isoformat(),
        "insights": insights,
        "strengths": strengths,
        "recommendations": recommendations,
        "daily_tip": "Consistency is built in small blocks. Focus on completing at least 3 core habits today to maintain your momentum."
    }

@router.post("/chat")
def chat_with_coach(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Context-aware chat bot responses simulating a senior AI life advisor."""
    msg = payload.message.lower().strip()
    user_id = current_user.id
    
    # Context statistics retrieval
    today = date.today()
    seven_days_ago = today - timedelta(days=7)
    
    study_recent = db.query(StudySession).filter(StudySession.user_id == user_id, StudySession.date >= seven_days_ago).all()
    total_study = sum(s.hours for s in study_recent)
    
    sleep_recent = db.query(SleepLog).filter(SleepLog.user_id == user_id, SleepLog.date >= seven_days_ago).all()
    avg_sleep = sum(s.hours for s in sleep_recent) / len(sleep_recent) if sleep_recent else 7.0
    
    dsa_problems = db.query(DSAProblem).filter(DSAProblem.user_id == user_id, DSAProblem.status == "solved").count()
    
    # ── Context Matching Heuristics ──
    if "study" in msg or "what should i study" in msg:
        reply = (
            f"Bhanu, you've clocked {total_study:.1f} hours of focused study this week. "
            "Based on your Master's Prep target, I recommend scheduling a 50-minute Pomodoro focus block "
            "on LSTM Neural Networks or completing your Shortlisted college checklist today."
        )
    elif "habit" in msg or "missing" in msg:
        reply = (
            "Looking at today's habit logs: you still have a few critical items unchecked. "
            "Aim to complete your morning gratitude journal and complete at least 25 minutes of vocal singing support warmups. "
            "Doing so will add +15 XP to your Gamification leveling Sage progress!"
        )
    elif "plan" in msg or "day" in msg:
        reply = (
            "Here is your recommended optimized routine: \n"
            "1. 🌅 Morning: 50-minute focused LeetCode study session on Array/String categories.\n"
            "2. 🏋️ Afternoon: Strength Workout session (Lean Bulk focus + Hydration check).\n"
            "3. 📖 Evening: Read 15 pages of your current book and write a nightly reflection entry."
        )
    elif "sleep" in msg:
        reply = (
            f"Your average sleep duration this week is {avg_sleep:.1f} hours. "
            "Your quality metrics indicate slight recovery drops. Avoid late screens and log off by 10:00 PM."
        )
    elif "dsa" in msg or "leetcode" in msg:
        reply = (
            f"You have solved a total of {dsa_problems} DSA problems on LeetCode. "
            "To unlock the Algo Warrior badge (15 problems solved), try completing 2 more medium difficulty array problems today."
        )
    elif "fitness" in msg or "workout" in msg:
        reply = (
            "Based on your lean bulk fitness metrics, focus on progressive overload on your compound movements. "
            "Ensure you hit 115g of protein intake today and drink 2,500ml water."
        )
    elif "consistency" in msg or "improve" in msg:
        reply = (
            "Consistency beats intensity. To improve your Life Score: "
            "1. Focus on maintaining a 3-day habits streak. "
            "2. Protect your streak using streak shields. "
            "3. Stack your habits (e.g. read immediately after drinking evening water)."
        )
    else:
        reply = (
            "Hello Bhanu! I'm your Atlas One AI Coach. Ask me to: "
            "'Analyze my study habits', 'What habits are missing today?', 'Plan my day', 'Summarize my DSA', or 'Analyze my sleep'."
        )
        
    return {
        "reply": reply,
        "coach_name": "Atlas One AI Advisor",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/reports/daily")
def get_daily_briefing(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "title": "🌅 Today's Master AI Briefing",
        "date": date.today().isoformat(),
        "summary": "Good morning Bhanu! Today represents a fresh start. Level up your sage progress by tracking your habits early.",
        "quote": "The secret of getting ahead is getting started.",
        "missions": [
            "Log 3 habits before noon",
            "Solve 1 DSA LeetCode array problem",
            "Track 2,000ml water consumption"
        ]
    }

@router.get("/reports/weekly")
def get_weekly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "title": "📊 Weekly Performance AI Report",
        "date_range": "Past 7 Days",
        "summary": "Focused study hours grew by 15% this week. Sleep cycles are stable, averaging 7.8 hours. Maintain compound lifting volume.",
        "grade": "A-",
        "highlights": [
            "Hit 8+ study hours targets",
            "Solved 4 DSA problems",
            "Maintained 4-day habits consistency"
        ]
    }

@router.get("/reports/monthly")
def get_monthly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "title": "🏆 Monthly Milestone AI Report",
        "month": "Current Month",
        "summary": "Exceptional overall consistency. Sage level rose from 2 to 3. Shortlisted CMU and Stanford application drafts SOP states are set to ready.",
        "unlocked_badges": ["Habit Builder", "Algo Warrior"],
        "discipline_index": 85
    }
