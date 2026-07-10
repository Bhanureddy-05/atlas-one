from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routers import (
    auth, users, dashboard, habits, study, dsa,
    interview_prep, projects, fitness, diet, sleep,
    singing, reading, goals, analytics, reports,
    daily_planner, settings, export, coach, journal,
    finance, career, knowledge, gamification, voice_journal, progress_photo,
    smartwatch, google_calendar, sharing, ml_analytics
)
from app.seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    try:
        seed_data()
    except Exception as e:
        print(f"Error seeding database: {e}")
    
    # Start scheduler daemon
    from app.utils.scheduler import scheduler
    scheduler.start()
    
    yield
    
    # Stop scheduler daemon
    scheduler.stop()


app = FastAPI(
    title="Atlas One API",
    description="Atlas One Personal Analytics & Predictive Insights API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://atlas-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(habits.router, prefix="/api/habits", tags=["habits"])
app.include_router(study.router, prefix="/api/study", tags=["study"])
app.include_router(dsa.router, prefix="/api/dsa", tags=["dsa"])
app.include_router(interview_prep.router, prefix="/api/interview", tags=["interview"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(fitness.router, prefix="/api/fitness", tags=["fitness"])
app.include_router(diet.router, prefix="/api/diet", tags=["diet"])
app.include_router(sleep.router, prefix="/api/sleep", tags=["sleep"])
app.include_router(singing.router, prefix="/api/singing", tags=["singing"])
app.include_router(reading.router, prefix="/api/reading", tags=["reading"])
app.include_router(goals.router, prefix="/api/goals", tags=["goals"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(daily_planner.router, prefix="/api/planner", tags=["planner"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(export.router, prefix="/api/export", tags=["export"])
app.include_router(coach.router, prefix="/api/coach", tags=["coach"])
app.include_router(journal.router, prefix="/api/journal", tags=["journal"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(career.router, prefix="/api/career", tags=["career"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["knowledge"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["gamification"])
app.include_router(voice_journal.router, prefix="/api/voice-journal", tags=["voice-journal"])
app.include_router(progress_photo.router, prefix="/api/progress-photo", tags=["progress-photo"])
app.include_router(smartwatch.router, prefix="/api/smartwatch", tags=["smartwatch"])
app.include_router(google_calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(sharing.router, prefix="/api/sharing", tags=["sharing"])
app.include_router(ml_analytics.router, prefix="/api/ml", tags=["ml"])


@app.get("/")
def root():
    return {"message": "Atlas One API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/health")
def api_health():
    return {"status": "healthy"}
