import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

def train_and_predict_productivity(df: pd.DataFrame):
    """
    Trains a Random Forest Regressor to predict:
    1. Daily productivity score
    2. Task completion probability
    Returns predictions for 'today' (last row in df) along with model confidence.
    """
    # Fallback if insufficient data
    if df.shape[0] < 7:
        return {
            "predicted_productivity": 75.0,
            "predicted_task_probability": 0.80,
            "confidence": 50,
            "explanation": "Insufficient historical data to train the AI models. Continue logging for at least 7 days to enable custom AI predictions.",
            "is_fallback": True
        }
        
    features = [
        "sleep_hours", "sleep_quality", "water_ml", "calories", 
        "workout_duration", "journal_mood", "weekday"
    ]
    
    # Check if target columns vary (if all are identical, ML won't work well, but it fits)
    X = df[features].fillna(0).values
    y_prod = df["productivity_score"].values
    y_tasks = df["task_completion_ratio"].values
    
    # Train Random Forest for Productivity Score
    rf_prod = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
    rf_prod.fit(X, y_prod)
    
    # Train Random Forest for Task Completion Ratio
    rf_tasks = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
    rf_tasks.fit(X, y_tasks)
    
    # Predict for the most recent day (today)
    current_features = X[-1].reshape(1, -1)
    pred_prod = rf_prod.predict(current_features)[0]
    pred_tasks = rf_tasks.predict(current_features)[0]
    
    # Calculate confidence based on the standard deviation of individual tree predictions (variance check)
    prod_tree_preds = [tree.predict(current_features)[0] for tree in rf_prod.estimators_]
    prod_std = np.std(prod_tree_preds)
    
    # Scale std to a 0-100 confidence score
    # Max reasonable standard deviation in productivity score (0-100 scale) is around 25
    confidence = int(max(10, min(98, 100 - (prod_std / 25.0 * 90.0))))
    
    # Generate explanation based on feature importances
    importances = rf_prod.feature_importances_
    top_feature_idx = np.argmax(importances)
    top_feature_name = features[top_feature_idx]
    
    feature_clean_names = {
        "sleep_hours": "sleep duration",
        "sleep_quality": "sleep quality",
        "water_ml": "hydration",
        "calories": "caloric intake",
        "workout_duration": "workout consistency",
        "journal_mood": "mood ratings",
        "weekday": "weekly routines"
    }
    
    explanation = f"Your productivity today is predicted to be {round(pred_prod, 1)}/100, heavily influenced by your {feature_clean_names.get(top_feature_name, top_feature_name)} patterns which are the strongest predictors in your history."
    
    # Ensure probabilities are bounded between 0 and 1
    pred_tasks = max(0.0, min(1.0, float(pred_tasks)))
    
    return {
        "predicted_productivity": round(float(pred_prod), 1),
        "predicted_task_probability": round(pred_tasks, 3),
        "confidence": confidence,
        "explanation": explanation,
        "is_fallback": False
    }
