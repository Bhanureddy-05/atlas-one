import pandas as pd
import numpy as np

def calculate_personal_scores(df: pd.DataFrame):
    """
    Computes daily and overall scores for the past 30 days:
    - Productivity Score
    - Health Score
    - Learning Score
    - Fitness Score
    - Consistency Score
    - Burnout Risk Score
    Returns summaries and historical trends.
    """
    n_days = df.shape[0]
    
    # Take the last 30 days for dashboard history (or fewer if not enough)
    df_30 = df.tail(30).copy()
    
    timeline = []
    
    for idx, row in df_30.iterrows():
        # 1. Productivity Score (habit completion ratio & study hours & dsa)
        prod = float(row["productivity_score"])
        
        # 2. Health Score (sleep quality, water intake, gym attendance, calorie balance)
        sleep_q = row["sleep_quality"] or 3.0
        water = row["water_ml"] or 0.0
        gym = row["attended_gym"] or 0.0
        cals = row["calories"] or 0.0
        
        # Balance calories (target ~2200 kcal is ideal, penalty for excess/starvation)
        cal_score = 30 - min(30, abs(cals - 2200) / 10.0) if cals > 0 else 10
        h_score = (sleep_q / 5.0 * 35) + (min(water / 2500.0, 1.0) * 35) + (15 if gym else 5) + cal_score
        h_score = max(10, min(100, float(h_score)))
        
        # 3. Learning Score (study hours & DSA problems solved)
        study_h = row["study_hours"] or 0.0
        dsa = row["dsa_solved"] or 0.0
        learn_score = min(study_h / 6.0 * 60.0, 60.0) + min(dsa / 2.0 * 40.0, 40.0)
        learn_score = max(5, min(100, float(learn_score)))
        
        # 4. Fitness Score (workout duration, gym attendance, calorie balance)
        workout_dur = row["workout_duration"] or 0.0
        fit_score = min(workout_dur / 60.0 * 50.0, 50.0) + (30 if gym else 0) + (20 if (1800 <= cals <= 2600) else 10)
        fit_score = max(5, min(100, float(fit_score)))
        
        # 5. Consistency Score (3-day rolling standard deviations vs streaks)
        # We can approximate consistency by combining habit ratio and study deviation
        habit_r = row["habit_completion_ratio"] or 0.0
        const_score = (habit_r * 60) + (40 if (study_h > 0 and sleep_q > 2.5) else 10)
        const_score = max(10, min(100, float(const_score)))
        
        timeline.append({
            "date": str(row["date"].date()),
            "productivity": round(prod, 1),
            "health": round(h_score, 1),
            "learning": round(learn_score, 1),
            "fitness": round(fit_score, 1),
            "consistency": round(const_score, 1)
        })
        
    # Calculate burnout risk dynamically based on rolling 3-day sleep and study metrics
    # If the user studies too much and sleeps too little, burnout risk is high.
    burnout_risk = 10 # Baseline risk
    
    if n_days >= 3:
        recent_sleep = df["sleep_hours"].tail(3).mean()
        recent_study = df["study_hours"].tail(3).mean()
        recent_sleep_q = df["sleep_quality"].tail(3).mean()
        
        # Condition A: sleep deprivation
        if recent_sleep < 5.5:
            burnout_risk += 35
        elif recent_sleep < 6.5:
            burnout_risk += 15
            
        # Condition B: excessive studying with low sleep
        if recent_study > 7.5 and recent_sleep < 6.0:
            burnout_risk += 40
        elif recent_study > 6.0 and recent_sleep_q < 2.5:
            burnout_risk += 20
            
        # Condition C: low wellness logs
        recent_water = df["water_ml"].tail(3).mean()
        if recent_water < 1200:
            burnout_risk += 10
            
    # Clip risk
    burnout_risk = max(5, min(95, int(burnout_risk)))
    
    # Calculate overall average scores
    avg_prod = float(np.mean([t["productivity"] for t in timeline])) if timeline else 75.0
    avg_health = float(np.mean([t["health"] for t in timeline])) if timeline else 70.0
    avg_learn = float(np.mean([t["learning"] for t in timeline])) if timeline else 65.0
    avg_fit = float(np.mean([t["fitness"] for t in timeline])) if timeline else 60.0
    avg_const = float(np.mean([t["consistency"] for t in timeline])) if timeline else 70.0
    
    return {
        "summary": {
            "productivity_score": round(avg_prod, 1),
            "health_score": round(avg_health, 1),
            "learning_score": round(avg_learn, 1),
            "fitness_score": round(avg_fit, 1),
            "consistency_score": round(avg_const, 1),
            "burnout_risk": burnout_risk,
            "overall_atlas_score": round((avg_prod * 0.3 + avg_health * 0.25 + avg_learn * 0.25 + avg_const * 0.2), 1)
        },
        "timeline": timeline
    }
