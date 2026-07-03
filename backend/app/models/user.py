from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    theme = Column(String(20), default="dark")
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_shields = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    habit_logs = relationship("HabitLog", back_populates="user", cascade="all, delete-orphan")
    study_topics = relationship("StudyTopic", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    dsa_topics = relationship("DSATopic", back_populates="user", cascade="all, delete-orphan")
    dsa_problems = relationship("DSAProblem", back_populates="user", cascade="all, delete-orphan")
    interview_topics = relationship("InterviewTopic", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    fitness_logs = relationship("FitnessLog", back_populates="user", cascade="all, delete-orphan")
    body_measurements = relationship("BodyMeasurement", back_populates="user", cascade="all, delete-orphan")
    food_logs = relationship("FoodLog", back_populates="user", cascade="all, delete-orphan")
    sleep_logs = relationship("SleepLog", back_populates="user", cascade="all, delete-orphan")
    singing_sessions = relationship("SingingSession", back_populates="user", cascade="all, delete-orphan")
    books = relationship("Book", back_populates="user", cascade="all, delete-orphan")
    reading_sessions = relationship("ReadingSession", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    planner_tasks = relationship("PlannerTask", back_populates="user", cascade="all, delete-orphan")
    planner_notes = relationship("PlannerNote", back_populates="user", cascade="all, delete-orphan")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    finance_logs = relationship("FinanceLog", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    masters_preps = relationship("MastersPrep", back_populates="user", cascade="all, delete-orphan")
    university_shortlists = relationship("UniversityShortlist", back_populates="user", cascade="all, delete-orphan")
    knowledge_items = relationship("KnowledgeItem", back_populates="user", cascade="all, delete-orphan")
    voice_journals = relationship("VoiceJournal", back_populates="user", cascade="all, delete-orphan")
    progress_photos = relationship("ProgressPhoto", back_populates="user", cascade="all, delete-orphan")
    smartwatch_syncs = relationship("SmartwatchSync", back_populates="user", cascade="all, delete-orphan")
    google_calendar_credentials = relationship("GoogleCalendarCredential", back_populates="user", cascade="all, delete-orphan")
    group_memberships = relationship("GroupMembership", back_populates="user", cascade="all, delete-orphan")
