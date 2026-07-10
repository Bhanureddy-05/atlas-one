from datetime import date, timedelta
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sklearn.linear_model import LogisticRegression

from app.models.goal import Goal

def predict_goal_probabilities(db: Session, user_id: int):
    """
    Predicts the achievement probability of all active goals for a user.
    Uses a blended model of Logistic Regression (trained on historical goals)
    and an analytical progress-to-time ratio model.
    """
    today = date.today()
    
    # 1. Fetch active goals
    active_goals = db.query(Goal).filter(
        Goal.user_id == user_id,
        Goal.is_completed == False
    ).all()
    
    if not active_goals:
        return []
        
    # 2. Fetch past goals for training the ML classifier
    past_goals = db.query(Goal).filter(
        Goal.user_id == user_id,
        (Goal.is_completed == True) | (Goal.target_date < today)
    ).all()
    
    # Train ML model if enough historical data (at least 5 samples)
    ml_model = None
    category_map = {"study": 0, "fitness": 1, "reading": 2}
    type_map = {"daily": 0, "weekly": 1, "monthly": 2, "yearly": 3}
    
    if len(past_goals) >= 5:
        training_records = []
        for g in past_goals:
            total_days = (g.target_date - g.start_date).days if g.target_date and g.start_date else 30
            total_days = max(1, total_days)
            cat_idx = category_map.get(str(g.category).lower(), 3) # 3 is default 'other'
            type_idx = type_map.get(str(g.goal_type).lower(), 1)
            
            training_records.append({
                "category": cat_idx,
                "goal_type": type_idx,
                "target_value": g.target_value or 1.0,
                "duration": total_days,
                "completed": 1 if g.is_completed else 0
            })
            
        train_df = pd.DataFrame(training_records)
        X = train_df[["category", "goal_type", "target_value", "duration"]].values
        y = train_df["completed"].values
        
        # Avoid crash if y is all 1s or all 0s
        if len(np.unique(y)) > 1:
            try:
                ml_model = LogisticRegression()
                ml_model.fit(X, y)
            except Exception:
                ml_model = None

    predictions = []
    
    for g in active_goals:
        # Calculate duration and time elapsed
        start = g.start_date or (today - timedelta(days=7))
        target = g.target_date or (today + timedelta(days=7))
        
        total_days = (target - start).days
        total_days = max(1, total_days)
        
        days_passed = (today - start).days
        days_passed = max(0, min(total_days, days_passed))
        
        time_elapsed_ratio = days_passed / total_days
        
        # Calculate progress ratio
        curr_val = g.current_value or 0.0
        targ_val = g.target_value or 1.0
        progress_ratio = curr_val / targ_val if targ_val > 0 else 0.0
        progress_ratio = min(1.0, progress_ratio)
        
        # Heuristic / Progress-based probability
        if progress_ratio >= 1.0:
            progress_prob = 1.0
        elif time_elapsed_ratio >= 1.0 and progress_ratio < 1.0:
            progress_prob = 0.0
        elif time_elapsed_ratio == 0:
            progress_prob = 0.5 # not started yet, neutral chance
        else:
            # required progress pace vs actual progress pace
            required_pace = (1.0 - progress_ratio) / (1.0 - time_elapsed_ratio)
            actual_pace = progress_ratio / time_elapsed_ratio
            
            # Probability calculation
            if actual_pace >= required_pace:
                # Ahead of schedule
                progress_prob = 0.7 + 0.25 * (actual_pace - required_pace)
            else:
                # Behind schedule
                progress_prob = 0.5 * (actual_pace / max(0.1, required_pace))
                
        progress_prob = max(0.02, min(0.98, float(progress_prob)))
        
        # ML-based probability
        ml_prob = 0.5 # Neutral fallback
        if ml_model:
            cat_idx = category_map.get(str(g.category).lower(), 3)
            type_idx = type_map.get(str(g.goal_type).lower(), 1)
            features = np.array([[cat_idx, type_idx, targ_val, total_days]])
            ml_prob = float(ml_model.predict_proba(features)[0][1])
            
        # Blend probabilities: 70% current progress, 30% historical model baseline
        blended_prob = 0.7 * progress_prob + 0.3 * ml_prob
        blended_prob = round(max(0.01, min(0.99, blended_prob)), 3)
        
        # Construct explanation text
        pct_progress = int(progress_ratio * 100)
        pct_time = int(time_elapsed_ratio * 100)
        
        if progress_ratio >= 1.0:
            explanation = "Goal achieved! Congratulations on completing this goal."
        elif time_elapsed_ratio >= 1.0 and progress_ratio < 1.0:
            explanation = "Deadline passed. Consider extending the target date or resetting the goal value."
        elif blended_prob >= 0.75:
            explanation = f"High completion probability ({int(blended_prob*100)}%). You have achieved {pct_progress}% of target with {pct_time}% of time elapsed. Your current pace is well ahead of schedule."
        elif blended_prob >= 0.45:
            explanation = f"Moderate completion probability ({int(blended_prob*100)}%). You have achieved {pct_progress}% of target with {pct_time}% of time elapsed. Maintain a steady pace to hit your goal."
        else:
            explanation = f"Low completion probability ({int(blended_prob*100)}%). You have achieved {pct_progress}% of target with {pct_time}% of time elapsed. To complete this goal, you must significantly increase your daily log rate."
            
        predictions.append({
            "goal_id": g.id,
            "title": g.title,
            "category": g.category or "general",
            "goal_type": g.goal_type or "daily",
            "current_value": float(curr_val),
            "target_value": float(targ_val),
            "unit": g.unit or "",
            "probability": blended_prob,
            "explanation": explanation
        })
        
    return predictions
