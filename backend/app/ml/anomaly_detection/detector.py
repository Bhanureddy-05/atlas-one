import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_anomalies(df: pd.DataFrame):
    """
    Fits an Isolation Forest to daily logs to detect outliers/anomalies
    (e.g., productivity drops, spending spikes, sleep abnormalities, missed workouts).
    Explains each anomaly by finding which metric deviated most from the mean.
    """
    n_days = df.shape[0]
    
    if n_days < 14:
        return {
            "anomalies": [],
            "message": "Anomaly detection requires at least 14 days of logged history.",
            "is_fallback": True
        }
        
    features = [
        "study_hours", "sleep_hours", "sleep_quality", 
        "calories", "workout_duration", "expense", "productivity_score"
    ]
    
    # Extract feature values, replace NaN/0 with defaults for standard deviation
    X = df[features].fillna(0).values
    
    # Fit Isolation Forest
    # We set contamination to 0.08 (roughly 8% of days are flagged as anomalous)
    clf = IsolationForest(contamination=0.08, random_state=42)
    labels = clf.fit_predict(X)
    
    # Calculate historical means and standard deviations
    means = df[features].mean()
    stds = df[features].std().replace(0, 1.0) # avoid division by zero
    
    anomalies_list = []
    
    # Find indices where label is -1
    anomaly_indices = np.where(labels == -1)[0]
    
    for idx in anomaly_indices:
        row = df.iloc[idx]
        date_str = str(row["date"].date())
        
        # Determine the primary contributing factor
        explanations = []
        severity = "low"
        
        # Check study drop
        if row["study_hours"] < (means["study_hours"] - 1.5 * stds["study_hours"]) and means["study_hours"] > 1.0:
            explanations.append(f"Productivity drop (studied {row['study_hours']}h vs avg {round(means['study_hours'], 1)}h)")
            severity = "medium"
            
        # Check sleep abnormality
        if row["sleep_hours"] < (means["sleep_hours"] - 1.8 * stds["sleep_hours"]):
            explanations.append(f"Severe sleep drop ({row['sleep_hours']}h sleep vs avg {round(means['sleep_hours'], 1)}h)")
            severity = "high"
        elif row["sleep_hours"] > (means["sleep_hours"] + 2.0 * stds["sleep_hours"]):
            explanations.append(f"Excessive sleep hypersomnia ({row['sleep_hours']}h sleep vs avg {round(means['sleep_hours'], 1)}h)")
            severity = "medium"
            
        # Check spending spike
        if row["expense"] > (means["expense"] + 2.0 * stds["expense"]) and row["expense"] > 50.0:
            explanations.append(f"Unusual spending spike (${round(row['expense'])} vs avg ${round(means['expense'])})")
            severity = "high"
            
        # Check calorie abnormality
        if row["calories"] < (means["calories"] - 2.0 * stds["calories"]) and row["calories"] > 0:
            explanations.append(f"Unusual calorie deficit ({round(row['calories'])} kcal vs avg {round(means['calories'])})")
            severity = "medium"
        elif row["calories"] > (means["calories"] + 2.0 * stds["calories"]):
            explanations.append(f"Calorie intake surge ({round(row['calories'])} kcal vs avg {round(means['calories'])})")
            severity = "medium"
            
        # Check missed workouts (usually works out, but duration is 0)
        if means["workout_duration"] > 20.0 and row["workout_duration"] == 0 and row["weekday"] in [0, 2, 4]: # Mon, Wed, Fri
            explanations.append("Missed standard workout session")
            if severity != "high":
                severity = "medium"
                
        # If no specific criteria matches but it's an outlier, give a combined explanation
        if not explanations:
            explanations.append("A atypical combination of sleep, calories, and productivity metrics was observed.")
            severity = "low"
            
        anomalies_list.append({
            "date": date_str,
            "severity": severity,
            "metrics": {
                "study_hours": float(row["study_hours"]),
                "sleep_hours": float(row["sleep_hours"]),
                "expense": float(row["expense"]),
                "calories": float(row["calories"]),
                "productivity_score": float(row["productivity_score"])
            },
            "alerts": explanations
        })
        
    # Sort anomalies by date descending (most recent first)
    anomalies_list = sorted(anomalies_list, key=lambda x: x["date"], reverse=True)
    
    return {
        "anomalies": anomalies_list,
        "message": f"Successfully analyzed {n_days} days of metrics. Found {len(anomalies_list)} outlier events.",
        "is_fallback": False
    }
