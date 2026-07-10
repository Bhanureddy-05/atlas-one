import sys
import os
# Add backend root path to import space
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import SessionLocal
from app.ml.pipeline import get_daily_features
from app.ml.prediction.productivity import train_and_predict_productivity
from app.ml.sentiment.analyzer import analyze_journal_history
from app.ml.forecasting.time_series import forecast_user_metrics
from app.ml.anomaly_detection.detector import detect_anomalies
from app.ml.scoring.health_productivity import calculate_personal_scores
from app.ml.insights.generator import generate_correlations_and_insights
from app.ml.prediction.goals import predict_goal_probabilities

def test_ml_pipeline():
    from app.database import Base, engine
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    user_id = 1  # demo user ID seeded on start
    
    try:
        print("1. Testing Daily Feature Extraction...")
        df = get_daily_features(db, user_id)
        print(f"SUCCESS: DataFrame loaded! Shape: {df.shape}")
        
        print("\n2. Testing Productivity Prediction (Random Forest)...")
        pred = train_and_predict_productivity(df)
        print(f"SUCCESS: Productivity Prediction: {pred}")
        
        print("\n3. Testing Sentiment NLP Analysis (VADER)...")
        sent = analyze_journal_history(df)
        print(f"SUCCESS: Sentiment Analysis Summary: avg_sentiment={sent['average_sentiment']}, pos_neg_ratio={sent['positive_negative_ratio']}")
        
        print("\n4. Testing Forecast Engine (Seasonal/Trend Regressions)...")
        fore = forecast_user_metrics(df)
        print(f"SUCCESS: Forecast Engine completed! 7-day weight forecast: {fore['weight']}")
        
        print("\n5. Testing Anomaly Detection (Isolation Forest)...")
        anom = detect_anomalies(df)
        print(f"SUCCESS: Anomaly Detection completed! Outlier events found: {len(anom['anomalies'])}")
        
        print("\n6. Testing Score Engine (Wellness Index & Burnout)...")
        sc = calculate_personal_scores(df)
        print(f"SUCCESS: Score Summary: {sc['summary']}")
        
        print("\n7. Testing Insight Matrix Generator (Pearson Correlations)...")
        ins = generate_correlations_and_insights(df)
        print(f"SUCCESS: Correlation Insights computed! Matrix cell count: {len(ins['heatmap'])}")
        
        print("\n8. Testing Goal Achievement Predictor (Blended LogReg)...")
        goals = predict_goal_probabilities(db, user_id)
        print(f"SUCCESS: Goal Probabilities calculated! Active goals count: {len(goals)}")
        
        # --- NEW TEST CASES FORsafe ML PLATFORM EXTENSION ---
        print("\n9. Testing Safe ML Manager predictions & versioning...")
        from app.ml import manager
        all_preds = manager.get_predictions_all(db, user_id)
        print(f"SUCCESS: manager predictions all: {all_preds}")
        
        print("\n10. Testing Explainable AI (XAI) feature explanations...")
        xai_prod = manager.get_xai_explanations(db, user_id, "productivity")
        xai_place = manager.get_xai_explanations(db, user_id, "placement")
        print(f"SUCCESS: XAI productivity: {xai_prod}")
        print(f"SUCCESS: XAI placement: {xai_place}")
        
        print("\n11. Testing Feature Importance weights...")
        importance = manager.get_feature_importances_all(db, user_id)
        print(f"SUCCESS: Feature importance count: {len(importance)}")
        
        print("\n12. Testing Continuous Learning manual retraining...")
        retrain_res = manager.train_and_register_new_model(db, user_id)
        print(f"SUCCESS: Retrain & validation status: {retrain_res}")
        
        print("\n13. Testing Personalized Coach recommendations...")
        from app.ml import coach_engine
        recs = coach_engine.generate_personalized_recommendations(db, user_id)
        print(f"SUCCESS: Personalized recommendations count: {len(recs)}")
        
        print("\n14. Testing Goal Optimizer...")
        opt = coach_engine.get_optimized_goals(db, user_id)
        print(f"SUCCESS: Optimized goals: {opt}")
        
        print("\n15. Testing Timeline Projections...")
        timeline = coach_engine.get_timeline_projections(db, user_id)
        print(f"SUCCESS: Timeline periods projected: {list(timeline.keys())}")
        
        print("\n==============================================")
        print("ALL EXTENDED MACHINE LEARNING PIPELINES RUN SUCCESSFULLY!")
        print("==============================================")
    except Exception as e:
        print(f"\nFAILURE: Test crashed due to error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_ml_pipeline()
