from datetime import date, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.habit import HabitLog, Habit
from app.models.study import StudySession
from app.models.dsa import DSAProblem
from app.auth import get_current_user

router = APIRouter()

@router.get("/status")
def get_gamification_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the user's current XP, level, active quests, and unlocked achievements."""
    user_id = current_user.id
    today = date.today()
    
    # 1. Evaluate Quests
    # Daily Quest: Toggle 3 habits today
    habit_logs_today = db.query(HabitLog).filter(HabitLog.user_id == user_id, HabitLog.date == today, HabitLog.completed == True).count()
    daily_quest = {
        "title": "Habit Disciple",
        "description": "Log at least 3 habits as completed today.",
        "progress": habit_logs_today,
        "target": 3,
        "completed": habit_logs_today >= 3,
        "xp_reward": 50
    }
    
    # Weekly Quest: Study 8 hours in last 7 days
    seven_days_ago = today - timedelta(days=7)
    study_time = db.query(StudySession).filter(StudySession.user_id == user_id, StudySession.date >= seven_days_ago).all()
    total_hours = sum(s.hours for s in study_time)
    weekly_quest = {
        "title": "Deep Focus Sprint",
        "description": "Study for at least 8 hours over the past week.",
        "progress": round(total_hours, 1),
        "target": 8.0,
        "completed": total_hours >= 8.0,
        "xp_reward": 150
    }
    
    # Monthly Quest: Solve 10 LeetCode problems in last 30 days
    thirty_days_ago = today - timedelta(days=30)
    dsa_count = db.query(DSAProblem).filter(DSAProblem.user_id == user_id, DSAProblem.solved_date >= thirty_days_ago, DSAProblem.status == "solved").count()
    monthly_quest = {
        "title": "DSA Mastermind",
        "description": "Solve 10 LeetCode / DSA problems this month.",
        "progress": dsa_count,
        "target": 10,
        "completed": dsa_count >= 10,
        "xp_reward": 300
    }

    # 2. Determine Achievements / Badges based on historical stats
    badges = []
    
    # Check total habits
    total_habits = db.query(Habit).filter(Habit.user_id == user_id).count()
    if total_habits >= 5:
        badges.append({
            "name": "Habit Builder",
            "icon": "🧱",
            "description": "Created at least 5 customized habits."
        })
        
    # Check if level is high
    if current_user.level >= 5:
        badges.append({
            "name": "Level 5 Sage",
            "icon": "🧙",
            "description": "Achieved level 5 through daily consistency."
        })

    # Check total DSA problems
    total_dsa = db.query(DSAProblem).filter(DSAProblem.user_id == user_id, DSAProblem.status == "solved").count()
    if total_dsa >= 15:
        badges.append({
            "name": "Algo Warrior",
            "icon": "⚔️",
            "description": "Solved 15 or more LeetCode algorithmic problems."
        })

    return {
        "level": current_user.level,
        "xp": current_user.xp,
        "xp_to_next_level": current_user.level * 100,
        "streak_shields": current_user.streak_shields,
        "quests": {
            "daily": daily_quest,
            "weekly": weekly_quest,
            "monthly": monthly_quest
        },
        "badges": badges
    }

@router.post("/buy-shield")
def purchase_streak_shield(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase a Streak Shield (costs 80 XP) to prevent streak losses on missed habits."""
    cost = 80
    total_xp = current_user.xp + ((current_user.level - 1) * 100) # Simple approximation of accumulated XP
    
    if current_user.level <= 1 and current_user.xp < cost:
        raise HTTPException(status_code=400, detail="Insufficient experience points (requires 80 XP)")
        
    # Deduct XP
    if current_user.xp >= cost:
        current_user.xp -= cost
    else:
        # Subtract across levels if needed
        deficit = cost - current_user.xp
        current_user.level -= 1
        current_user.xp = (current_user.level * 100) - deficit
        
    current_user.streak_shields += 1
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Streak Shield purchased successfully!",
        "streak_shields": current_user.streak_shields,
        "xp": current_user.xp,
        "level": current_user.level
    }
