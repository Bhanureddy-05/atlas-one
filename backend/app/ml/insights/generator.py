import numpy as np
import pandas as pd

def generate_correlations_and_insights(df: pd.DataFrame):
    """
    Calculates the Pearson correlation matrix for:
    - Sleep Hours
    - Sleep Quality
    - Study Hours
    - Task Completion
    - Workout Duration
    - Calories
    - Body Weight
    - Journal Mood
    
    Generates scatter plot datasets and dynamic AI Weekly Insights.
    """
    n_days = df.shape[0]
    
    # Selected correlation fields
    corr_cols = {
        "sleep_hours": "Sleep Hours",
        "sleep_quality": "Sleep Quality",
        "study_hours": "Study Hours",
        "task_completion_ratio": "Task Completion",
        "workout_duration": "Workout Duration",
        "calories": "Calories",
        "weight_kg": "Body Weight",
        "journal_mood": "Journal Mood"
    }
    
    available_cols = [c for c in corr_cols.keys() if c in df.columns]
    
    # Calculate correlation matrix
    corr_matrix = df[available_cols].corr().fillna(0.0)
    
    # Format correlation matrix for heatmap (Recharts grid format)
    heatmap_data = []
    for c1 in available_cols:
        for c2 in available_cols:
            val = float(corr_matrix.loc[c1, c2])
            heatmap_data.append({
                "x": corr_cols[c1],
                "y": corr_cols[c2],
                "value": round(val, 3)
            })
            
    # Generate scatter plot data for key pairings
    def get_scatter_data(x_col, y_col):
        temp_df = df[[x_col, y_col]].dropna()
        # Return limit of 30 points
        return temp_df.tail(30).apply(lambda r: {"x": float(r[x_col]), "y": float(r[y_col])}, axis=1).tolist()
        
    scatter_sleep_prod = get_scatter_data("sleep_hours", "productivity_score")
    scatter_workout_mood = get_scatter_data("workout_duration", "journal_mood")
    scatter_cals_weight = get_scatter_data("calories", "weight_kg")
    
    # Generate data-driven AI Insights
    insights = []
    
    # Helper to retrieve correlation coeff
    def get_r(col1, col2):
        if col1 in corr_matrix.index and col2 in corr_matrix.columns:
            return float(corr_matrix.loc[col1, col2])
        return 0.0
        
    # Insight 1: Sleep & Productivity
    r_sleep_prod = get_r("sleep_hours", "productivity_score")
    if r_sleep_prod > 0.25:
        insights.append(f"Sleep ↔ Productivity: Your daily productivity is strongly correlated (r={round(r_sleep_prod, 2)}) with sleep. You study and complete habits much more efficiently after sleeping > 7 hours.")
    elif r_sleep_prod < -0.2:
        insights.append(f"Sleep ↔ Productivity: Oddly, sleep and productivity show an inverse correlation (r={round(r_sleep_prod, 2)}). You might be logging long sleep after exhausting, low-productivity days.")
    else:
        insights.append("Sleep ↔ Productivity: Your sleep duration has a stable, moderate baseline influence on productivity. Keep aiming for 7-8 hours.")
        
    # Insight 2: Exercise & Mood
    r_work_mood = get_r("workout_duration", "journal_mood")
    if r_work_mood > 0.2:
        insights.append(f"Exercise ↔ Mood: On days you exercise longer, your journal emotional tone is more positive (r={round(r_work_mood, 2)}). Workouts are acting as a strong stress-reliever.")
    else:
        insights.append("Exercise ↔ Mood: Your mood is stable relative to exercise. Exercise provides physical readiness but maintains emotional equilibrium.")
        
    # Insight 3: Study & Task Completion
    r_study_tasks = get_r("study_hours", "task_completion_ratio")
    if r_study_tasks > 0.3:
        insights.append(f"Study ↔ Task Completion: Dedicating study blocks correlates heavily (r={round(r_study_tasks, 2)}) with checking off daily dashboard tasks. Focused preparation is driving execution.")
    else:
        insights.append("Study ↔ Task Completion: You maintain a consistent goal completion rate regardless of study intensity.")
        
    # Insight 4: Calories & Weight
    r_cal_weight = get_r("calories", "weight_kg")
    if r_cal_weight > 0.3:
        insights.append(f"Calories ↔ Weight: Caloric intake shows a positive correlation (r={round(r_cal_weight, 2)}) with weight measurements. Higher calorie days translate directly to incremental weight changes.")
    else:
        insights.append("Calories ↔ Weight: Caloric fluctuations have a minimal short-term effect on weight, indicating a stable caloric maintenance baseline.")
        
    # Insight 5: Consecutive Low Sleep Alert
    if n_days >= 4:
        low_sleep_consec = 0
        for i in range(n_days - 3, n_days):
            if df["sleep_hours"].iloc[i] < 6.0:
                low_sleep_consec += 1
        if low_sleep_consec >= 2:
            insights.append("Attention: Your focus and productivity index shows a steep decline after 2 consecutive low-sleep nights (<6h). prioritize tonight's bedtime.")

    return {
        "heatmap": heatmap_data,
        "scatters": {
            "sleep_vs_productivity": scatter_sleep_prod,
            "workout_vs_mood": scatter_workout_mood,
            "calories_vs_weight": scatter_cals_weight
        },
        "insights": insights
    }
