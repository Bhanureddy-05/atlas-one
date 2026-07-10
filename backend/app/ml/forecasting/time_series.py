import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from datetime import date, timedelta

def forecast_user_metrics(df: pd.DataFrame):
    """
    Generates a 7-day forecast for:
    - Study hours
    - Body weight
    - Sleep hours
    - Calories
    - Exercise consistency (gym probability)
    
    Returns lists of forecasted values, dates, and recommendations.
    """
    n_days = df.shape[0]
    today = date.today()
    forecast_dates = [str(today + timedelta(days=i+1)) for i in range(7)]
    
    if n_days < 7:
        return {
            "dates": forecast_dates,
            "study_hours": [2.0] * 7,
            "weight": [70.0] * 7,
            "sleep_hours": [7.0] * 7,
            "calories": [2000.0] * 7,
            "gym_probability": [0.5] * 7,
            "recommendations": [
                "Insufficient logs to customize forecasts. Continue tracking for 7 days to generate AI predictions.",
                "Standard Goal: Aim for 2.0 hours of study hours daily.",
                "Standard Goal: Track body weight at least once a week in Fitness page."
            ],
            "is_fallback": True
        }
        
    # Helper seasonal + trend forecaster for daily variables
    def forecast_seasonal_variable(target_col, min_val=0.0, max_val=None):
        # 1. Day of week average
        dow_avg = df.groupby("weekday")[target_col].mean().to_dict()
        overall_avg = df[target_col].mean()
        
        # 2. Recent level adjustment (rolling mean offset)
        recent_avg = df[target_col].tail(5).mean()
        offset = recent_avg - overall_avg
        
        forecast_vals = []
        for i in range(7):
            future_day = today + timedelta(days=i+1)
            future_dow = future_day.weekday()
            
            # Base seasonal forecast
            base_val = dow_avg.get(future_dow, overall_avg)
            # Add trend adjustment
            pred_val = base_val + offset
            
            # Clip values
            pred_val = max(min_val, pred_val)
            if max_val is not None:
                pred_val = min(max_val, pred_val)
                
            forecast_vals.append(round(float(pred_val), 1))
        return forecast_vals

    # Apply seasonal forecaster
    study_forecast = forecast_seasonal_variable("study_hours", min_val=0.0, max_val=16.0)
    sleep_forecast = forecast_seasonal_variable("sleep_hours", min_val=0.0, max_val=24.0)
    calories_forecast = forecast_seasonal_variable("calories", min_val=0.0, max_val=10000.0)
    gym_forecast = forecast_seasonal_variable("attended_gym", min_val=0.0, max_val=1.0)
    
    # Weight forecasting (using Linear Regression for trend)
    try:
        X = np.arange(n_days).reshape(-1, 1)
        y = df["weight_kg"].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        future_X = np.arange(n_days, n_days + 7).reshape(-1, 1)
        weight_forecast = model.predict(future_X)
        weight_forecast = [round(float(w), 1) for w in weight_forecast]
    except Exception:
        # Fallback to last known weight
        last_weight = float(df["weight_kg"].iloc[-1]) if "weight_kg" in df.columns else 70.0
        weight_forecast = [last_weight] * 7

    # Generate smart, data-driven recommendations
    recs = []
    
    # 1. Study recommendation
    avg_study_f = np.mean(study_forecast)
    if avg_study_f < 2.0:
        recs.append("Study hours are projected to dip. Plan a 90-minute core learning block tomorrow to stay consistent.")
    else:
        recs.append("Great momentum! Your study forecast remains strong. Schedule a brief revision session mid-week.")
        
    # 2. Weight/Calorie recommendation
    weight_trend = weight_forecast[-1] - weight_forecast[0]
    avg_cal_f = np.mean(calories_forecast)
    if weight_trend > 0.3 and avg_cal_f > 2200:
        recs.append(f"Weight is trending upwards (+{round(weight_trend, 1)} kg). Consider adjusting caloric intake to ~2,000 kcal or increasing cardio.")
    elif weight_trend < -0.3:
        recs.append(f"Weight is trending downwards (-{round(abs(weight_trend), 1)} kg). Ensure you are hitting protein targets to preserve muscle.")
    else:
        recs.append("Your body weight is stable. Maintain current caloric balance and hydration levels.")
        
    # 3. Sleep recommendation
    avg_sleep_f = np.mean(sleep_forecast)
    if avg_sleep_f < 6.5:
        recs.append("Sleep debt warning: projected sleep hours average is under 6.5h. Aim for an offline curfew by 10 PM tonight.")
    else:
        recs.append("Sleep quality and duration forecasts are healthy. Maintain your current sleep/wake window.")
        
    # 4. Fitness/Gym consistency
    avg_gym_f = np.mean(gym_forecast)
    if avg_gym_f < 0.3:
        recs.append("Workout frequency is forecasted to drop. Pack your gym bag tonight to increase commit rate tomorrow.")
    else:
        recs.append("Excellent consistency! Your exercise frequency matches your personal growth goals.")

    return {
        "dates": forecast_dates,
        "study_hours": study_forecast,
        "weight": weight_forecast,
        "sleep_hours": sleep_forecast,
        "calories": calories_forecast,
        "gym_probability": gym_forecast,
        "recommendations": recs,
        "is_fallback": False
    }
