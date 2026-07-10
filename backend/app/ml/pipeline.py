import pandas as pd
import numpy as np
from datetime import date, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.study import StudySession
from app.models.habit import Habit, HabitLog
from app.models.diet import FoodLog
from app.models.sleep import SleepLog
from app.models.fitness import FitnessLog, BodyMeasurement
from app.models.journal import JournalEntry
from app.models.finance import FinanceLog
from app.models.dsa import DSAProblem
from app.models.daily_planner import PlannerTask

def get_daily_features(db: Session, user_id: int, days_limit: int = 60) -> pd.DataFrame:
    """
    Extracts historical metrics day-by-day and builds a consolidated DataFrame for training ML models.
    """
    today = date.today()
    start_date = today - timedelta(days=days_limit - 1)
    
    # Generate complete list of dates
    date_list = [start_date + timedelta(days=i) for i in range(days_limit)]
    
    # 1. Study hours by day
    study_data = db.query(
        StudySession.date,
        func.sum(StudySession.hours).label("study_hours")
    ).filter(
        StudySession.user_id == user_id,
        StudySession.date >= start_date
    ).group_by(StudySession.date).all()
    study_map = {row.date: row.study_hours for row in study_data}
    
    # 2. DSA problems solved by day
    dsa_data = db.query(
        DSAProblem.solved_date.label("date"),
        func.count(DSAProblem.id).label("dsa_solved")
    ).filter(
        DSAProblem.user_id == user_id,
        DSAProblem.status == "solved",
        DSAProblem.solved_date >= start_date
    ).group_by(DSAProblem.solved_date).all()
    dsa_map = {row.date: row.dsa_solved for row in dsa_data}
    
    # 3. Diet logs (calories, water, protein)
    diet_data = db.query(
        FoodLog.date,
        func.sum(FoodLog.calories).label("calories"),
        func.sum(FoodLog.water_ml).label("water_ml"),
        func.sum(FoodLog.protein_g).label("protein_g")
    ).filter(
        FoodLog.user_id == user_id,
        FoodLog.date >= start_date
    ).group_by(FoodLog.date).all()
    diet_map = {row.date: (row.calories or 0.0, row.water_ml or 0.0, row.protein_g or 0.0) for row in diet_data}
    
    # 4. Sleep logs
    sleep_data = db.query(SleepLog).filter(
        SleepLog.user_id == user_id,
        SleepLog.date >= start_date
    ).all()
    sleep_map = {s.date: (s.hours or 7.0, s.quality or 3) for s in sleep_data}
    
    # 5. Fitness logs (gym attendance, workout duration)
    fitness_data = db.query(
        FitnessLog.date,
        func.sum(FitnessLog.duration_minutes).label("duration"),
        func.max(FitnessLog.attended_gym).label("attended_gym")
    ).filter(
        FitnessLog.user_id == user_id,
        FitnessLog.date >= start_date
    ).group_by(FitnessLog.date).all()
    fitness_map = {row.date: (row.duration or 0.0, bool(row.attended_gym)) for row in fitness_data}
    
    # 5b. Body measurements (weight)
    weight_data = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == user_id,
        BodyMeasurement.date >= start_date
    ).all()
    weight_map = {w.date: (w.weight_kg or 0.0) for w in weight_data}
    
    # 6. Journal logs (mood, text entry len)
    journal_data = db.query(JournalEntry).filter(
        JournalEntry.user_id == user_id,
        JournalEntry.date >= start_date
    ).all()
    journal_map = {}
    for j in journal_data:
        text_len = len(j.reflection or "") + len(j.lessons_learned or "")
        journal_map[j.date] = (j.mood or 3, text_len, j.reflection or "", j.lessons_learned or "", j.gratitude_1 or "")
        
    # 7. Finance spending
    spending_data = db.query(
        FinanceLog.date,
        func.sum(FinanceLog.amount).label("expense")
    ).filter(
        FinanceLog.user_id == user_id,
        FinanceLog.transaction_type == "expense",
        FinanceLog.date >= start_date
    ).group_by(FinanceLog.date).all()
    spending_map = {row.date: row.expense for row in spending_data}
    
    # 8. Habit completion ratio
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    total_habits = len(habits)
    
    completed_logs = db.query(
        HabitLog.date,
        func.count(HabitLog.id).label("completed_count")
    ).filter(
        HabitLog.user_id == user_id,
        HabitLog.date >= start_date,
        HabitLog.completed == True
    ).group_by(HabitLog.date).all()
    completed_habit_map = {row.date: row.completed_count for row in completed_logs}

    # 9. Planner Task completion ratio (Optimized load in memory)
    tasks = db.query(PlannerTask).filter(
        PlannerTask.user_id == user_id,
        PlannerTask.date >= start_date
    ).all()
    tasks_map = {}
    for t in tasks:
        if t.date not in tasks_map:
            tasks_map[t.date] = {"total": 0, "completed": 0}
        tasks_map[t.date]["total"] += 1
        if t.is_completed:
            tasks_map[t.date]["completed"] += 1
    
    # Assemble raw records
    records = []
    for d in date_list:
        study_h = study_map.get(d, 0.0) or 0.0
        dsa_s = dsa_map.get(d, 0) or 0
        cals, water, prot = diet_map.get(d, (0.0, 0.0, 0.0))
        sleep_h, sleep_q = sleep_map.get(d, (7.0, 3))
        workout_min, gym = fitness_map.get(d, (0.0, False))
        weight_val = weight_map.get(d, 0.0)
        mood, text_len, reflection, lessons, gratitude = journal_map.get(d, (3, 0, "", "", ""))
        expense = spending_map.get(d, 0.0) or 0.0
        
        completed_h = completed_habit_map.get(d, 0)
        habit_ratio = (completed_h / total_habits) if total_habits > 0 else 0.0

        t_info = tasks_map.get(d, {"total": 0, "completed": 0})
        task_ratio = (t_info["completed"] / t_info["total"]) if t_info["total"] > 0 else 1.0
        
        # Derived targets
        # Define a daily productivity score: 40% habit completion, 40% study hours (max 6), 20% dsa solved (max 2)
        prod_score = (habit_ratio * 40.0) + (min(study_h / 6.0, 1.0) * 40.0) + (min(dsa_s / 2.0, 1.0) * 20.0)
        
        records.append({
            "date": pd.to_datetime(d),
            "weekday": d.weekday(),
            "study_hours": study_h,
            "dsa_solved": dsa_s,
            "calories": cals,
            "water_ml": water,
            "protein_g": prot,
            "sleep_hours": sleep_h,
            "sleep_quality": sleep_q,
            "workout_duration": workout_min,
            "attended_gym": 1 if gym else 0,
            "weight_kg": weight_val,
            "journal_mood": mood,
            "journal_len": text_len,
            "journal_reflection": reflection,
            "journal_lessons": lessons,
            "journal_gratitude": gratitude,
            "expense": expense,
            "habit_completion_ratio": habit_ratio,
            "task_completion_ratio": task_ratio,
            "productivity_score": round(prod_score, 1)
        })
        
    df = pd.DataFrame(records)
    if "weight_kg" in df.columns:
        df["weight_kg"] = df["weight_kg"].replace(0.0, np.nan).ffill().bfill().fillna(70.0)
    return df
