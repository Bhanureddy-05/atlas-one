from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import numpy as np

def analyze_text_sentiment(text: str):
    """
    Analyzes raw text using VADER Sentiment.
    """
    if not text or not text.strip():
        return {"compound": 0.0, "pos": 0.0, "neu": 1.0, "neg": 0.0, "sentiment": "neutral"}
        
    analyzer = SentimentIntensityAnalyzer()
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]
    
    if compound >= 0.1:
        sentiment = "positive"
    elif compound <= -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"
        
    return {
        "compound": round(compound, 3),
        "pos": round(scores["pos"], 3),
        "neu": round(scores["neu"], 3),
        "neg": round(scores["neg"], 3),
        "sentiment": sentiment
    }

def analyze_journal_history(df: pd.DataFrame):
    """
    Analyzes historical journal entries in the dataframe to generate:
    - Daily sentiment scores
    - Emotional trends
    - Positive vs Negative ratio
    - Mood distribution
    - Weekly emotion report
    """
    # Filter rows that have journals
    journal_df = df[df["journal_reflection"].str.len() > 0].copy()
    
    if journal_df.empty:
        return {
            "average_sentiment": 0.0,
            "positive_negative_ratio": 1.0,
            "mood_counts": {"positive": 0, "neutral": 0, "negative": 0},
            "sentiment_trend": [],
            "weekly_emotion_report": "No journal entries found in this period. Write a daily reflection to unlock sentiment analysis."
        }
        
    # Analyze daily texts
    daily_results = []
    for idx, row in journal_df.iterrows():
        combined_text = f"{row['journal_reflection']} {row['journal_lessons']} {row['journal_gratitude']}"
        res = analyze_text_sentiment(combined_text)
        daily_results.append({
            "date": str(row["date"].date()),
            "compound": res["compound"],
            "sentiment": res["sentiment"],
            "mood_rating": row["journal_mood"] # from the 1-5 slider
        })
        
    res_df = pd.DataFrame(daily_results)
    
    avg_compound = float(res_df["compound"].mean())
    mood_counts = res_df["sentiment"].value_counts().to_dict()
    
    pos_count = mood_counts.get("positive", 0)
    neg_count = mood_counts.get("negative", 0)
    ratio = round(pos_count / max(1, neg_count), 2)
    
    # Chronological trend
    trend = res_df[["date", "compound", "mood_rating"]].to_dict(orient="records")
    
    # Weekly Emotion Report Generator
    recent_week = res_df.tail(7)
    recent_avg = recent_week["compound"].mean() if not recent_week.empty else 0.0
    
    if recent_avg >= 0.25:
        weekly_report = "Your recent reflections carry a strongly positive tone. Expressions of gratitude and accomplishments dominate your journal entries, indicating high mental wellbeing."
    elif recent_avg <= -0.1:
        weekly_report = "Your journal sentiment shows an emotional dip. Reflections hint at frustration or fatigue. It is recommended to reduce study workload, prioritize sleep, and log a rest day."
    else:
        weekly_report = "Your emotional state has been stable and balanced this week. Reflections show a neutral-to-positive perspective with consistent gratitude logging."
        
    return {
        "average_sentiment": round(avg_compound, 2),
        "positive_negative_ratio": ratio,
        "mood_counts": {
            "positive": int(pos_count),
            "neutral": int(mood_counts.get("neutral", 0)),
            "negative": int(neg_count)
        },
        "sentiment_trend": trend,
        "weekly_emotion_report": weekly_report
    }
