from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(300), nullable=False)
    calories_per_100g = Column(Float, default=0.0)
    protein_per_100g = Column(Float, default=0.0)
    carbs_per_100g = Column(Float, default=0.0)
    fat_per_100g = Column(Float, default=0.0)
    fiber_per_100g = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], viewonly=True)
    food_logs = relationship("FoodLog", back_populates="food_item", cascade="all, delete-orphan")


class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=True)
    date = Column(Date, nullable=False)
    meal_type = Column(String(50), nullable=False)  # breakfast, lunch, dinner, snack
    food_name = Column(String(300), nullable=False)  # custom name or from food_items
    quantity_g = Column(Float, default=100.0)
    calories = Column(Float, default=0.0)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)
    water_ml = Column(Float, default=0.0)  # for water entries
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="food_logs")
    food_item = relationship("FoodItem", back_populates="food_logs")
