"""
Seed data for Atlas One. Run this file directly to populate the database.
Usage: python -m app.seed
"""
import os
from datetime import datetime, date, timedelta
import random
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.models.study import StudyTopic, StudySession
from app.models.dsa import DSATopic, DSAProblem
from app.models.interview import InterviewTopic
from app.models.project import Project
from app.models.fitness import FitnessLog, BodyMeasurement
from app.models.diet import FoodLog
from app.models.sleep import SleepLog
from app.models.singing import SingingSession
from app.models.reading import Book, ReadingSession
from app.models.goal import Goal
from app.models.daily_planner import PlannerTask
from app.auth import get_password_hash


def seed_data():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded by username or email to make it idempotent
        existing_user = db.query(User).filter(
            (User.email == "bhanu@atlasone.app") | (User.username == "bhanu")
        ).first()
        if existing_user:
            print("Default seed user 'bhanu' or email 'bhanu@atlasone.app' already exists. Skipping data seeding.")
            return

        # Create demo user
        user = User(
            email="bhanu@atlasone.app",
            username="bhanu",
            full_name="Bhanu Pratap",
            hashed_password=get_password_hash("atlas2026"),
            bio="Data Science aspirant | DSA learner | Fitness enthusiast",
            theme="dark",
        )
        db.add(user)
        db.flush()

        today = date.today()

        # ── Habits ────────────────────────────────────────────────────────────
        habits_data = [
            {"name": "Wake at 4:30 AM", "icon": "🌅", "color": "#f59e0b", "target_time": "04:30"},
            {"name": "Meditation", "icon": "🧘", "color": "#8b5cf6", "target_time": "05:00"},
            {"name": "Mobility", "icon": "🤸", "color": "#06b6d4"},
            {"name": "Singing Practice", "icon": "🎵", "color": "#ec4899"},
            {"name": "DSA Practice", "icon": "💻", "color": "#6366f1"},
            {"name": "Data Science Study", "icon": "📊", "color": "#3b82f6"},
            {"name": "College", "icon": "🏫", "color": "#10b981"},
            {"name": "Gym", "icon": "💪", "color": "#ef4444"},
            {"name": "Cooking", "icon": "🍳", "color": "#f97316"},
            {"name": "Reading", "icon": "📚", "color": "#84cc16"},
            {"name": "Interview Prep", "icon": "🎯", "color": "#14b8a6"},
            {"name": "Sleep before 10 PM", "icon": "🌙", "color": "#6366f1", "target_time": "22:00"},
        ]
        habits = []
        for h_data in habits_data:
            h = Habit(user_id=user.id, **h_data, streak=random.randint(1, 21), longest_streak=random.randint(15, 45))
            db.add(h)
            habits.append(h)
        db.flush()

        # Add habit logs for last 30 days
        for habit in habits:
            for i in range(30):
                log_date = today - timedelta(days=i)
                completed = random.random() > 0.25  # 75% completion rate
                db.add(HabitLog(
                    user_id=user.id,
                    habit_id=habit.id,
                    date=log_date,
                    completed=completed,
                ))

        # ── Study Topics ──────────────────────────────────────────────────────
        study_topics_data = [
            ("Python Basics", "Python", 95, 45.0),
            ("NumPy", "Python", 85, 20.0),
            ("Pandas", "Python", 80, 25.0),
            ("Matplotlib & Seaborn", "Visualization", 70, 15.0),
            ("Statistics & Probability", "Statistics", 65, 30.0),
            ("Exploratory Data Analysis", "EDA", 75, 20.0),
            ("Machine Learning", "ML", 50, 35.0),
            ("Deep Learning", "DL", 30, 15.0),
            ("NLP", "NLP", 20, 8.0),
            ("ML Projects", "Projects", 40, 12.0),
        ]
        for name, cat, comp, hrs in study_topics_data:
            topic = StudyTopic(
                user_id=user.id,
                name=name,
                category=cat,
                completion_percent=comp,
                total_hours=hrs,
                last_revised=today - timedelta(days=random.randint(0, 7)),
            )
            db.add(topic)
        db.flush()

        # Study sessions for last 30 days
        all_topics = db.query(StudyTopic).filter(StudyTopic.user_id == user.id).all()
        for i in range(30):
            s_date = today - timedelta(days=i)
            if random.random() > 0.2:  # 80% of days
                for _ in range(random.randint(1, 3)):
                    topic = random.choice(all_topics)
                    db.add(StudySession(
                        user_id=user.id,
                        topic_id=topic.id,
                        date=s_date,
                        hours=round(random.uniform(0.5, 3.0), 1),
                    ))

        # ── DSA Topics ────────────────────────────────────────────────────────
        dsa_topics_data = [
            ("Arrays", 25, 18, 5),
            ("Strings", 20, 12, 3),
            ("HashMap", 18, 10, 2),
            ("Stack & Queue", 15, 8, 2),
            ("Linked List", 12, 7, 1),
            ("Trees", 10, 6, 2),
            ("Graphs", 5, 4, 1),
            ("Heap", 8, 5, 1),
            ("Dynamic Programming", 6, 8, 3),
            ("Greedy", 10, 6, 1),
            ("Backtracking", 4, 3, 1),
            ("Binary Search", 12, 8, 2),
        ]
        dsa_topics = []
        for name, easy, med, hard in dsa_topics_data:
            t = DSATopic(
                user_id=user.id, name=name,
                easy_solved=easy, medium_solved=med, hard_solved=hard,
                accuracy=round(random.uniform(70, 95), 1),
                last_revised=today - timedelta(days=random.randint(0, 5)),
            )
            db.add(t)
            dsa_topics.append(t)
        db.flush()

        # ── Interview Topics ──────────────────────────────────────────────────
        interview_data = [
            ("Python for DS", "Python", 80, 4),
            ("SQL Queries", "SQL", 70, 4),
            ("Statistics & ML Theory", "Statistics", 65, 3),
            ("ML Algorithms", "Machine Learning", 55, 3),
            ("HR Questions", "HR", 90, 5),
            ("Behavioral STAR", "Behavioral", 85, 4),
            ("Resume Projects", "Resume", 75, 4),
            ("Mock Interviews", "Mock", 50, 3),
        ]
        for name, cat, comp, conf in interview_data:
            db.add(InterviewTopic(
                user_id=user.id, name=name, category=cat,
                completion_percent=comp, confidence_rating=conf,
                last_practiced=today - timedelta(days=random.randint(0, 7)),
            ))

        # ── Projects ──────────────────────────────────────────────────────────
        projects_data = [
            ("Customer Churn Prediction", "Python, Sklearn, Pandas", "completed", 100),
            ("Movie Recommendation System", "Python, Collaborative Filtering", "in_progress", 65),
            ("Stock Price Predictor", "Python, LSTM, Keras", "in_progress", 40),
            ("NLP Sentiment Analyzer", "Python, NLTK, Transformers", "planning", 10),
            ("Atlas One Dashboard", "React, FastAPI, PostgreSQL", "in_progress", 80),
        ]
        for name, tech, status, prog in projects_data:
            db.add(Project(
                user_id=user.id, name=name, technology=tech,
                status=status, progress_percent=prog,
                start_date=today - timedelta(days=random.randint(10, 90)),
                github_url=f"https://github.com/bhanu/{name.lower().replace(' ', '-')}",
            ))

        # ── Fitness ───────────────────────────────────────────────────────────
        workout_types = ["Push", "Pull", "Legs", "Cardio", "Full Body", "Rest"]
        start_weight = 72.5
        for i in range(30):
            f_date = today - timedelta(days=i)
            attended = random.random() > 0.35
            db.add(FitnessLog(
                user_id=user.id,
                date=f_date,
                workout_type=random.choice(workout_types) if attended else "Rest",
                duration_minutes=random.randint(45, 90) if attended else 0,
                calories_burned=random.randint(300, 600) if attended else 0,
                attended_gym=attended,
            ))
            if i % 7 == 0:
                db.add(BodyMeasurement(
                    user_id=user.id,
                    date=f_date,
                    weight_kg=round(start_weight - (i * 0.05) + random.uniform(-0.3, 0.3), 1),
                    body_fat_percent=round(18 - (i * 0.05), 1),
                    waist_cm=round(80 - (i * 0.03), 1),
                    chest_cm=98.5,
                    arms_cm=35.0,
                    legs_cm=58.0,
                ))

        # ── Diet ──────────────────────────────────────────────────────────────
        meals_data = [
            ("breakfast", "Oats with milk", 350, 15, 55, 8, 5),
            ("lunch", "Rice, Dal, Vegetables", 600, 25, 90, 8, 6),
            ("dinner", "Roti, Sabzi, Curd", 500, 20, 70, 10, 4),
            ("snack", "Banana & Peanut Butter", 200, 6, 28, 8, 2),
        ]
        for i in range(14):
            f_date = today - timedelta(days=i)
            for meal_type, food_name, cals, prot, carbs, fat, fiber in meals_data:
                db.add(FoodLog(
                    user_id=user.id,
                    date=f_date,
                    meal_type=meal_type,
                    food_name=food_name,
                    quantity_g=250,
                    calories=cals + random.randint(-30, 30),
                    protein_g=prot,
                    carbs_g=carbs,
                    fat_g=fat,
                    fiber_g=fiber,
                ))
            # Water
            db.add(FoodLog(
                user_id=user.id,
                date=f_date,
                meal_type="water",
                food_name="Water",
                quantity_g=0,
                calories=0,
                water_ml=random.randint(2000, 3500),
            ))

        # ── Sleep ─────────────────────────────────────────────────────────────
        for i in range(30):
            s_date = today - timedelta(days=i)
            hrs = round(random.uniform(5.5, 8.5), 1)
            db.add(SleepLog(
                user_id=user.id,
                date=s_date,
                sleep_time="22:30",
                wake_time="06:30",
                hours=hrs,
                quality=random.randint(2, 5),
            ))

        # ── Singing ───────────────────────────────────────────────────────────
        for i in range(20):
            s_date = today - timedelta(days=i)
            if random.random() > 0.3:
                db.add(SingingSession(
                    user_id=user.id,
                    date=s_date,
                    practice_minutes=random.randint(20, 60),
                    breathing_exercises_minutes=random.randint(5, 15),
                    alankars_practiced=random.randint(3, 8),
                    songs_practiced='["Tum Hi Ho", "Arijit Singh Songs"]',
                    quality_rating=random.randint(3, 5),
                ))

        # ── Reading ───────────────────────────────────────────────────────────
        books_data = [
            ("Atomic Habits", "James Clear", "Self-help", 320, 320, "completed"),
            ("Deep Work", "Cal Newport", "Productivity", 296, 296, "completed"),
            ("Python Crash Course", "Eric Matthes", "Technical", 544, 400, "reading"),
            ("The Pragmatic Programmer", "Andrew Hunt", "Technical", 352, 120, "reading"),
            ("Thinking, Fast and Slow", "Daniel Kahneman", "Psychology", 499, 0, "want_to_read"),
        ]
        books = []
        for title, author, genre, total, read, status in books_data:
            comp = (read / total * 100) if total > 0 else 0
            b = Book(
                user_id=user.id,
                title=title,
                author=author,
                genre=genre,
                total_pages=total,
                pages_read=read,
                completion_percent=comp,
                status=status,
                rating=random.randint(4, 5) if status == "completed" else None,
                start_date=today - timedelta(days=random.randint(10, 60)),
                completed_date=today - timedelta(days=random.randint(1, 30)) if status == "completed" else None,
            )
            db.add(b)
            books.append(b)
        db.flush()

        for i in range(15):
            r_date = today - timedelta(days=i)
            if random.random() > 0.4:
                book = books[2]  # Python Crash Course
                db.add(ReadingSession(
                    user_id=user.id,
                    book_id=book.id,
                    date=r_date,
                    pages_read=random.randint(10, 40),
                    reading_minutes=random.randint(20, 60),
                ))

        # ── Goals ─────────────────────────────────────────────────────────────
        goals_data = [
            ("Study 3+ hours daily", "daily", "study", 3, 2.5, "hours"),
            ("Complete 2 DSA problems", "daily", "dsa", 2, 1, "problems"),
            ("Drink 3L water", "daily", "health", 3000, 2500, "ml"),
            ("Study ML for 20 hours this week", "weekly", "study", 20, 12, "hours"),
            ("Complete Arrays DSA topic", "weekly", "dsa", 100, 70, "percent"),
            ("Read 50 pages this week", "weekly", "reading", 50, 30, "pages"),
            ("Complete Machine Learning module", "monthly", "study", 100, 50, "percent"),
            ("Solve 100 DSA problems", "monthly", "dsa", 100, 67, "problems"),
            ("Attend gym 20 days", "monthly", "fitness", 20, 14, "days"),
            ("Complete ML specialization", "yearly", "study", 100, 40, "percent"),
            ("Get placed in a top company", "yearly", "career", 100, 20, "percent"),
        ]
        for title, gtype, cat, target, current, unit in goals_data:
            comp = min((current / target) * 100, 100) if target > 0 else 0
            db.add(Goal(
                user_id=user.id,
                title=title,
                goal_type=gtype,
                category=cat,
                target_value=target,
                current_value=current,
                unit=unit,
                completion_percent=comp,
                is_completed=(comp >= 100),
                start_date=today.replace(day=1),
            ))

        # ── Planner Tasks ─────────────────────────────────────────────────────
        today_tasks = [
            ("Wake up & Morning Routine", 4, "high", "routine"),
            ("DSA Practice - Arrays", 6, "high", "study"),
            ("Data Science - EDA Chapter", 9, "high", "study"),
            ("Gym Session - Chest & Triceps", 17, "high", "fitness"),
            ("Reading - 30 pages", 20, "medium", "reading"),
            ("Interview Prep - ML Theory", 21, "medium", "study"),
            ("Singing Practice", 18, "low", "singing"),
        ]
        for title, hour, priority, category in today_tasks:
            db.add(PlannerTask(
                user_id=user.id,
                date=today,
                title=title,
                hour_slot=hour,
                priority=priority,
                category=category,
                is_completed=hour < 12,
            ))

        # ── Journal Entries ───────────────────────────────────────────────────
        from app.models.journal import JournalEntry
        db.add(JournalEntry(
            user_id=user.id,
            date=today,
            entry_type="morning",
            mood=4,
            gratitude_1="Woke up refreshed at 4:30 AM",
            gratitude_2="Finished arrays sliding window problems",
            gratitude_3="Strong coffee session",
            lessons_learned="Consistency beats intensity every single day."
        ))
        db.add(JournalEntry(
            user_id=user.id,
            date=today - timedelta(days=1),
            entry_type="night",
            mood=3,
            reflection="Productive day overall, but sleep schedule was pushed due to work.",
            lessons_learned="Avoid caffeine past 3 PM to sleep easily."
        ))

        # ── Finance Logs ──────────────────────────────────────────────────────
        from app.models.finance import FinanceLog
        finance_data = [
            (today - timedelta(days=15), "income", 1500.0, "Scholarship", "Monthly stipend"),
            (today - timedelta(days=12), "expense", 450.0, "Rent", "Housing rent contribution"),
            (today - timedelta(days=10), "expense", 85.50, "Grocery", "Whole Foods grocery list"),
            (today - timedelta(days=5), "savings", 200.0, "Mutual Funds", "Auto savings allocation"),
            (today - timedelta(days=2), "expense", 12.99, "Subscription", "Spotify Premium"),
        ]
        for f_date, t_type, amt, cat, desc in finance_data:
            db.add(FinanceLog(
                user_id=user.id, date=f_date, transaction_type=t_type,
                amount=amt, category=cat, description=desc
            ))

        # ── Career Placement & Masters Prep ───────────────────────────────────
        from app.models.career import JobApplication, MastersPrep, UniversityShortlist
        db.add(JobApplication(
            user_id=user.id, company="Amazon", role="Data Scientist Intern",
            status="online_test", date_applied=today - timedelta(days=10),
            notes="Passed OA 1. Awaiting OA 2 scheduling details.",
            leetcode_progress="Solved 15 array & string problems",
            resume_version="Bhanu_Pratap_DS_v2"
        ))
        db.add(JobApplication(
            user_id=user.id, company="NVIDIA", role="Deep Learning Engineer",
            status="applied", date_applied=today - timedelta(days=5),
            notes="Applied through referral. Resume under review.",
            leetcode_progress="Solved 10 dynamic programming questions",
            resume_version="Bhanu_Pratap_DL_v3"
        ))

        db.add(MastersPrep(
            user_id=user.id, ielts_score=8.0, gre_score=322,
            sop_status="completed", lor_count=3,
            visa_status="Appointment booked for July 15",
            loan_status="Sanctioned"
        ))

        db.add(UniversityShortlist(
            user_id=user.id, university_name="Carnegie Mellon University",
            program="MS in Machine Learning", deadline=today + timedelta(days=60),
            status="applying"
        ))
        db.add(UniversityShortlist(
            user_id=user.id, university_name="Stanford University",
            program="MS in Computer Science", deadline=today + timedelta(days=75),
            status="shortlisted"
        ))

        # ── Knowledge Items ───────────────────────────────────────────────────
        from app.models.knowledge import KnowledgeItem
        db.add(KnowledgeItem(
            user_id=user.id, title="LSTM Neural Networks",
            content_type="research",
            content="Long Short-Term Memory networks are a type of recurrent neural network capable of learning order dependence in sequence prediction problems. Useful for time-series forecasting.",
            ai_summary="Research review on LSTM networks for sequence prediction and time-series forecasting."
        ))
        db.add(KnowledgeItem(
            user_id=user.id, title="Vocal Breathing Technique",
            content_type="idea",
            content="Daily diaphragmatic breathing practice: 4s inhale, 4s hold, 8s exhale. Helps regulate vocal support for singing classical alankars.",
            ai_summary="Breathing exercises routine designed for voice and singing support."
        ))
        # ── Voice Journals ────────────────────────────────────────────────────
        from app.models.voice_journal import VoiceJournal
        db.add(VoiceJournal(
            user_id=user.id, date=today - timedelta(days=2),
            audio_path=None,
            transcript="I had a highly focused study session this morning. Practiced three SQL query problems and built the customer churn prediction neural network layers. Highly productive day.",
            ai_summary="Logged study achievements on SQL queries and machine learning churn prediction.",
            mood="Positive 😊"
        ))

        # ── Progress Photos ───────────────────────────────────────────────────
        from app.models.progress_photo import ProgressPhoto
        db.add(ProgressPhoto(
            user_id=user.id, date=today - timedelta(days=30),
            photo_path="/api/progress-photo/image/seed_init.jpg",
            weight_kg=72.5,
            notes="Initial checkout weight. Focusing on lean bulking and mobility split."
        ))
        db.add(ProgressPhoto(
            user_id=user.id, date=today,
            photo_path="/api/progress-photo/image/seed_today.jpg",
            weight_kg=71.8,
            notes="Weight dropped slightly, muscle definitions improved. Higher recovery rating."
        ))

        # Create copy of mock files if not exists
        os.makedirs(os.path.join("uploads", "photos"), exist_ok=True)
        for name in ["seed_init.jpg", "seed_today.jpg"]:
            path = os.path.join("uploads", "photos", name)
            if not os.path.exists(path):
                with open(path, "wb") as f:
                    f.write(b"mock_binary_photo_data")

        # ── Smartwatch Sync ───────────────────────────────────────────────────
        from app.models.smartwatch import SmartwatchSync
        db.add(SmartwatchSync(
            user_id=user.id, provider="google_fit",
            sync_status="success",
            metrics_data={"steps": 10500, "calories_burned": 520, "heart_rate_avg": 70, "sleep_hours": 7.8}
        ))
        db.add(SmartwatchSync(
            user_id=user.id, provider="apple_health",
            sync_status="success",
            metrics_data={"steps": 9200, "calories_burned": 480, "heart_rate_avg": 72, "sleep_hours": 8.0}
        ))

        # ── Google Calendar Credentials ───────────────────────────────────────
        from app.models.google_calendar import GoogleCalendarCredential
        db.add(GoogleCalendarCredential(
            user_id=user.id,
            access_token="seed_mock_access_token",
            refresh_token="seed_mock_refresh_token",
            expires_at=datetime.utcnow() + timedelta(days=1)
        ))

        # ── Family Sharing Groups ─────────────────────────────────────────────
        from app.models.sharing import FamilyGroup, GroupMembership, SharedGoal
        group = FamilyGroup(name="Pratap Family Vault", owner_id=user.id)
        db.add(group)
        db.flush()

        db.add(GroupMembership(group_id=group.id, user_id=user.id, role="owner"))
        db.add(SharedGoal(
            group_id=group.id, title="🚶 Shared 10k Steps Daily Challenge",
            description="Everyone hit at least 10,000 steps daily to maintain health score.",
            target_value=10000, current_value=6400, category="fitness"
        ))

        db.commit()
        print("SUCCESS: Seed data created successfully!")
        print("   Email: bhanu@atlasone.app")
        print("   Password: atlas2026")

    except Exception as e:
        db.rollback()
        print(f"ERROR: Seed error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
