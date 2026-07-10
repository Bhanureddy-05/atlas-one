from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class MLModelVersion(Base):
    __tablename__ = "ml_model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_tag = Column(String(50), unique=True, index=True, nullable=False)
    algorithm = Column(String(100), nullable=False)
    dataset_size = Column(Integer, nullable=False)
    accuracy_metrics = Column(JSON, nullable=False)  # MAE, RMSE, R2, Precision, Recall, etc.
    training_date = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=False)

    predictions = relationship("MLPredictionHistory", back_populates="model_version")


class MLPredictionHistory(Base):
    __tablename__ = "ml_prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_version_id = Column(Integer, ForeignKey("ml_model_versions.id", ondelete="SET NULL"), nullable=True)
    prediction_type = Column(String(50), nullable=False)  # productivity, goals, placement, burnout
    inputs = Column(JSON, nullable=False)
    prediction_output = Column(JSON, nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    model_version = relationship("MLModelVersion", back_populates="predictions")


class MLRecommendationHistory(Base):
    __tablename__ = "ml_recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # productivity, reading, gym, sleep, learning
    recommendation_text = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MLSimulationLog(Base):
    __tablename__ = "ml_simulation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    inputs = Column(JSON, nullable=False)
    outputs = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
