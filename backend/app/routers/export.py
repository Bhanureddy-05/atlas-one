import csv
import json
from io import StringIO
from datetime import date, datetime
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.habit import Habit, HabitLog
from app.models.study import StudyTopic, StudySession
from app.models.dsa import DSATopic, DSAProblem
from app.models.interview import InterviewTopic, InterviewSession
from app.models.project import Project
from app.models.fitness import FitnessLog, BodyMeasurement
from app.models.diet import FoodLog, FoodItem
from app.models.sleep import SleepLog
from app.models.singing import SingingSession
from app.models.reading import Book, ReadingSession
from app.models.goal import Goal
from app.models.daily_planner import PlannerTask, PlannerNote, PomodoroSession
from app.auth import get_current_user

router = APIRouter()

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code (dates, datetimes)"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def parse_date(date_str: str):
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str).date()
    except Exception:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except Exception:
            return None

def parse_datetime(dt_str: str):
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str)
    except Exception:
        return None

@router.get("/backup")
def export_backup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compile all user data into a single JSON payload for local backup."""
    user_id = current_user.id
    
    backup_data = {
        "version": "1.0",
        "exported_at": datetime.utcnow().isoformat(),
        "user": {
            "email": current_user.email,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "bio": current_user.bio,
            "theme": current_user.theme
        },
        "habits": [
            {"id": h.id, "name": h.name, "icon": h.icon, "color": h.color, "target_time": h.target_time, "streak": h.streak, "longest_streak": h.longest_streak}
            for h in db.query(Habit).filter(Habit.user_id == user_id).all()
        ],
        "habit_logs": [
            {"habit_id": hl.habit_id, "date": hl.date, "completed": hl.completed}
            for hl in db.query(HabitLog).filter(HabitLog.user_id == user_id).all()
        ],
        "study_topics": [
            {"id": st.id, "name": st.name, "category": st.category, "completion_percent": st.completion_percent, "total_hours": st.total_hours, "notes": st.notes, "resources": st.resources, "last_revised": st.last_revised, "target_date": st.target_date}
            for st in db.query(StudyTopic).filter(StudyTopic.user_id == user_id).all()
        ],
        "study_sessions": [
            {"topic_id": ss.topic_id, "date": ss.date, "hours": ss.hours, "notes": ss.notes}
            for ss in db.query(StudySession).filter(StudySession.user_id == user_id).all()
        ],
        "dsa_topics": [
            {"id": dt.id, "name": dt.name, "easy_solved": dt.easy_solved, "medium_solved": dt.medium_solved, "hard_solved": dt.hard_solved, "accuracy": dt.accuracy, "notes": dt.notes, "last_revised": dt.last_revised}
            for dt in db.query(DSATopic).filter(DSATopic.user_id == user_id).all()
        ],
        "dsa_problems": [
            {"topic_id": dp.topic_id, "title": dp.title, "difficulty": dp.difficulty, "status": dp.status, "leetcode_url": dp.leetcode_url, "company_tags": dp.company_tags, "notes": dp.notes, "solved_date": dp.solved_date, "attempts": dp.attempts}
            for dp in db.query(DSAProblem).filter(DSAProblem.user_id == user_id).all()
        ],
        "interview_topics": [
            {"id": it.id, "name": it.name, "category": it.category, "completion_percent": it.completion_percent, "confidence_rating": it.confidence_rating, "notes": it.notes, "last_practiced": it.last_practiced}
            for it in db.query(InterviewTopic).filter(InterviewTopic.user_id == user_id).all()
        ],
        "interview_sessions": [
            {"topic_id": ises.topic_id, "date": ises.date, "duration_minutes": ises.duration_minutes, "session_type": ises.session_type, "confidence_rating": ises.confidence_rating, "notes": ises.notes}
            for ises in db.query(InterviewSession).filter(InterviewSession.user_id == user_id).all()
        ],
        "projects": [
            {"name": p.name, "description": p.description, "technology": p.technology, "status": p.status, "progress_percent": p.progress_percent, "start_date": p.start_date, "end_date": p.end_date, "github_url": p.github_url, "live_url": p.live_url}
            for p in db.query(Project).filter(Project.user_id == user_id).all()
        ],
        "fitness_logs": [
            {"date": fl.date, "workout_type": fl.workout_type, "duration_minutes": fl.duration_minutes, "calories_burned": fl.calories_burned, "exercises": fl.exercises, "notes": fl.notes}
            for fl in db.query(FitnessLog).filter(FitnessLog.user_id == user_id).all()
        ],
        "body_measurements": [
            {"date": bm.date, "weight_kg": bm.weight_kg, "body_fat_percent": bm.body_fat_percent, "waist_cm": bm.waist_cm, "chest_cm": bm.chest_cm, "arms_cm": bm.arms_cm, "legs_cm": bm.legs_cm, "notes": bm.notes}
            for bm in db.query(BodyMeasurement).filter(BodyMeasurement.user_id == user_id).all()
        ],
        "food_logs": [
            {"date": fd.date, "meal_type": fd.meal_type, "food_name": fd.food_name, "calories": fd.calories, "protein_g": fd.protein_g, "carbs_g": fd.carbs_g, "fat_g": fd.fat_g, "fiber_g": fd.fiber_g, "water_ml": fd.water_ml}
            for fd in db.query(FoodLog).filter(FoodLog.user_id == user_id).all()
        ],
        "sleep_logs": [
            {"date": sl.date, "sleep_time": sl.sleep_time, "wake_time": sl.wake_time, "hours": sl.hours, "quality_rating": sl.quality_rating, "notes": sl.notes}
            for sl in db.query(SleepLog).filter(SleepLog.user_id == user_id).all()
        ],
        "singing_sessions": [
            {"date": sng.date, "duration_minutes": sng.duration_minutes, "song_practiced": sng.song_practiced, "exercises_done": sng.exercises_done, "pitch_accuracy": sng.pitch_accuracy, "notes": sng.notes, "audio_url": sng.audio_url}
            for sng in db.query(SingingSession).filter(SingingSession.user_id == user_id).all()
        ],
        "books": [
            {"id": b.id, "title": b.title, "author": b.author, "genre": b.genre, "total_pages": b.total_pages, "pages_read": b.pages_read, "completion_percent": b.completion_percent, "status": b.status, "start_date": b.start_date, "completed_date": b.completed_date, "rating": b.rating, "notes": b.notes, "highlights": b.highlights, "cover_url": b.cover_url}
            for b in db.query(Book).filter(Book.user_id == user_id).all()
        ],
        "reading_sessions": [
            {"book_id": rs.book_id, "date": rs.date, "pages_read": rs.pages_read, "reading_minutes": rs.reading_minutes, "notes": rs.notes}
            for rs in db.query(ReadingSession).filter(ReadingSession.user_id == user_id).all()
        ],
        "goals": [
            {"title": g.title, "description": g.description, "category": g.category, "goal_type": g.goal_type, "target_value": g.target_value, "current_value": g.current_value, "unit": g.unit, "deadline": g.deadline, "is_completed": g.is_completed, "milestones": g.milestones}
            for g in db.query(Goal).filter(Goal.user_id == user_id).all()
        ],
        "planner_tasks": [
            {"date": pt.date, "title": pt.title, "description": pt.description, "hour_slot": pt.hour_slot, "priority": pt.priority, "category": pt.category, "is_completed": pt.is_completed, "completed_at": pt.completed_at}
            for pt in db.query(PlannerTask).filter(PlannerTask.user_id == user_id).all()
        ],
        "planner_notes": [
            {"date": pn.date, "content": pn.content}
            for pn in db.query(PlannerNote).filter(PlannerNote.user_id == user_id).all()
        ],
        "pomodoro_sessions": [
            {"date": ps.date, "task_name": ps.task_name, "duration_minutes": ps.duration_minutes, "completed": ps.completed}
            for ps in db.query(PomodoroSession).filter(PomodoroSession.user_id == user_id).all()
        ]
    }
    
    # Render with custom serial for dates
    serialized = json.dumps(backup_data, default=json_serial, indent=2)
    return StreamingResponse(
        StringIO(serialized),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=lifeos_backup_{datetime.now().strftime('%Y%m%d')}.json"}
    )

@router.post("/restore")
async def restore_backup(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restore database state from an uploaded backup JSON file."""
    user_id = current_user.id
    try:
        contents = await file.read()
        backup = json.loads(contents.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid file payload: {e}")
        
    # Clear existing user database tables (except the User account itself)
    db.query(HabitLog).filter(HabitLog.user_id == user_id).delete()
    db.query(Habit).filter(Habit.user_id == user_id).delete()
    db.query(StudySession).filter(StudySession.user_id == user_id).delete()
    db.query(StudyTopic).filter(StudyTopic.user_id == user_id).delete()
    db.query(DSAProblem).filter(DSAProblem.user_id == user_id).delete()
    db.query(DSATopic).filter(DSATopic.user_id == user_id).delete()
    db.query(InterviewSession).filter(InterviewSession.user_id == user_id).delete()
    db.query(InterviewTopic).filter(InterviewTopic.user_id == user_id).delete()
    db.query(Project).filter(Project.user_id == user_id).delete()
    db.query(FitnessLog).filter(FitnessLog.user_id == user_id).delete()
    db.query(BodyMeasurement).filter(BodyMeasurement.user_id == user_id).delete()
    db.query(FoodLog).filter(FoodLog.user_id == user_id).delete()
    db.query(SleepLog).filter(SleepLog.user_id == user_id).delete()
    db.query(SingingSession).filter(SingingSession.user_id == user_id).delete()
    db.query(ReadingSession).filter(ReadingSession.user_id == user_id).delete()
    db.query(Book).filter(Book.user_id == user_id).delete()
    db.query(Goal).filter(Goal.user_id == user_id).delete()
    db.query(PlannerTask).filter(PlannerTask.user_id == user_id).delete()
    db.query(PlannerNote).filter(PlannerNote.user_id == user_id).delete()
    db.query(PomodoroSession).filter(PomodoroSession.user_id == user_id).delete()
    db.commit()

    # Map created IDs so relations link up properly
    habit_id_map = {}
    study_id_map = {}
    dsa_id_map = {}
    interview_id_map = {}
    book_id_map = {}

    # Restore Habits
    for h in backup.get("habits", []):
        new_h = Habit(
            user_id=user_id, name=h["name"], icon=h["icon"], color=h["color"],
            target_time=h.get("target_time"), streak=h.get("streak", 0), longest_streak=h.get("longest_streak", 0)
        )
        db.add(new_h)
        db.flush()
        habit_id_map[h["id"]] = new_h.id

    # Restore Habit Logs
    for hl in backup.get("habit_logs", []):
        mapped_id = habit_id_map.get(hl["habit_id"])
        if mapped_id:
            db.add(HabitLog(
                user_id=user_id, habit_id=mapped_id,
                date=parse_date(hl["date"]), completed=hl["completed"]
            ))

    # Restore Study Topics
    for st in backup.get("study_topics", []):
        new_st = StudyTopic(
            user_id=user_id, name=st["name"], category=st["category"],
            completion_percent=st.get("completion_percent", 0.0), total_hours=st.get("total_hours", 0.0),
            notes=st.get("notes"), resources=st.get("resources"),
            last_revised=parse_date(st.get("last_revised")), target_date=parse_date(st.get("target_date"))
        )
        db.add(new_st)
        db.flush()
        study_id_map[st["id"]] = new_st.id

    # Restore Study Sessions
    for ss in backup.get("study_sessions", []):
        mapped_id = study_id_map.get(ss["topic_id"])
        if mapped_id:
            db.add(StudySession(
                user_id=user_id, topic_id=mapped_id,
                date=parse_date(ss["date"]), hours=ss["hours"], notes=ss.get("notes")
            ))

    # Restore DSA Topics
    for dt in backup.get("dsa_topics", []):
        new_dt = DSATopic(
            user_id=user_id, name=dt["name"], easy_solved=dt.get("easy_solved", 0),
            medium_solved=dt.get("medium_solved", 0), hard_solved=dt.get("hard_solved", 0),
            accuracy=dt.get("accuracy", 0.0), notes=dt.get("notes"),
            last_revised=parse_date(dt.get("last_revised"))
        )
        db.add(new_dt)
        db.flush()
        dsa_id_map[dt["id"]] = new_dt.id

    # Restore DSA Problems
    for dp in backup.get("dsa_problems", []):
        mapped_id = dsa_id_map.get(dp["topic_id"])
        if mapped_id:
            db.add(DSAProblem(
                user_id=user_id, topic_id=mapped_id, title=dp["title"],
                difficulty=dp["difficulty"], status=dp.get("status", "unsolved"),
                leetcode_url=dp.get("leetcode_url"), company_tags=dp.get("company_tags"),
                notes=dp.get("notes"), solved_date=parse_date(dp.get("solved_date")),
                attempts=dp.get("attempts", 1)
            ))

    # Restore Interview Topics
    for it in backup.get("interview_topics", []):
        new_it = InterviewTopic(
            user_id=user_id, name=it["name"], category=it["category"],
            completion_percent=it.get("completion_percent", 0.0),
            confidence_rating=it.get("confidence_rating", 1), notes=it.get("notes"),
            last_practiced=parse_date(it.get("last_practiced"))
        )
        db.add(new_it)
        db.flush()
        interview_id_map[it["id"]] = new_it.id

    # Restore Interview Sessions
    for ises in backup.get("interview_sessions", []):
        mapped_id = interview_id_map.get(ises["topic_id"])
        if mapped_id:
            db.add(InterviewSession(
                user_id=user_id, topic_id=mapped_id, date=parse_date(ises["date"]),
                duration_minutes=ises.get("duration_minutes", 30), session_type=ises.get("session_type", "study"),
                confidence_rating=ises.get("confidence_rating", 3), notes=ises.get("notes")
            ))

    # Restore Projects
    for p in backup.get("projects", []):
        db.add(Project(
            user_id=user_id, name=p["name"], description=p.get("description"),
            technology=p["technology"], status=p.get("status", "planning"),
            progress_percent=p.get("progress_percent", 0), start_date=parse_date(p.get("start_date")),
            end_date=parse_date(p.get("end_date")), github_url=p.get("github_url"), live_url=p.get("live_url")
        ))

    # Restore Fitness Logs
    for fl in backup.get("fitness_logs", []):
        db.add(FitnessLog(
            user_id=user_id, date=parse_date(fl["date"]), workout_type=fl["workout_type"],
            duration_minutes=fl.get("duration_minutes", 0), calories_burned=fl.get("calories_burned", 0),
            exercises=fl.get("exercises"), notes=fl.get("notes")
        ))

    # Restore Body Measurements
    for bm in backup.get("body_measurements", []):
        db.add(BodyMeasurement(
            user_id=user_id, date=parse_date(bm["date"]), weight_kg=bm.get("weight_kg"),
            body_fat_percent=bm.get("body_fat_percent"), waist_cm=bm.get("waist_cm"),
            chest_cm=bm.get("chest_cm"), arms_cm=bm.get("arms_cm"), legs_cm=bm.get("legs_cm"),
            notes=bm.get("notes")
        ))

    # Restore Food Logs
    for fd in backup.get("food_logs", []):
        db.add(FoodLog(
            user_id=user_id, date=parse_date(fd["date"]), meal_type=fd["meal_type"],
            food_name=fd["food_name"], calories=fd.get("calories", 0.0),
            protein_g=fd.get("protein_g", 0.0), carbs_g=fd.get("carbs_g", 0.0),
            fat_g=fd.get("fat_g", 0.0), fiber_g=fd.get("fiber_g", 0.0), water_ml=fd.get("water_ml", 0.0)
        ))

    # Restore Sleep Logs
    for sl in backup.get("sleep_logs", []):
        db.add(SleepLog(
            user_id=user_id, date=parse_date(sl["date"]), sleep_time=sl.get("sleep_time"),
            wake_time=sl.get("wake_time"), hours=sl.get("hours", 0.0),
            quality_rating=sl.get("quality_rating", 3), notes=sl.get("notes")
        ))

    # Restore Singing Sessions
    for sng in backup.get("singing_sessions", []):
        db.add(SingingSession(
            user_id=user_id, date=parse_date(sng["date"]), duration_minutes=sng.get("duration_minutes", 0),
            song_practiced=sng.get("song_practiced"), exercises_done=sng.get("exercises_done"),
            pitch_accuracy=sng.get("pitch_accuracy"), notes=sng.get("notes"), audio_url=sng.get("audio_url")
        ))

    # Restore Books
    for b in backup.get("books", []):
        new_b = Book(
            user_id=user_id, title=b["title"], author=b.get("author"), genre=b.get("genre"),
            total_pages=b.get("total_pages", 0), pages_read=b.get("pages_read", 0),
            completion_percent=b.get("completion_percent", 0.0), status=b.get("status", "want_to_read"),
            start_date=parse_date(b.get("start_date")), completed_date=parse_date(b.get("completed_date")),
            rating=b.get("rating"), notes=b.get("notes"), highlights=b.get("highlights"), cover_url=b.get("cover_url")
        )
        db.add(new_b)
        db.flush()
        book_id_map[b["id"]] = new_b.id

    # Restore Reading Sessions
    for rs in backup.get("reading_sessions", []):
        mapped_id = book_id_map.get(rs["book_id"])
        if mapped_id:
            db.add(ReadingSession(
                user_id=user_id, book_id=mapped_id, date=parse_date(rs["date"]),
                pages_read=rs["pages_read"], reading_minutes=rs.get("reading_minutes", 0),
                notes=rs.get("notes")
            ))

    # Restore Goals
    for g in backup.get("goals", []):
        db.add(Goal(
            user_id=user_id, title=g["title"], description=g.get("description"),
            category=g["category"], goal_type=g["goal_type"], target_value=g["target_value"],
            current_value=g.get("current_value", 0.0), unit=g.get("unit", ""),
            deadline=parse_date(g.get("deadline")), is_completed=g.get("is_completed", False),
            milestones=g.get("milestones")
        ))

    # Restore Planner Tasks
    for pt in backup.get("planner_tasks", []):
        db.add(PlannerTask(
            user_id=user_id, date=parse_date(pt["date"]), title=pt["title"],
            description=pt.get("description"), hour_slot=pt.get("hour_slot"),
            priority=pt.get("priority", "medium"), category=pt.get("category"),
            is_completed=pt.get("is_completed", False), completed_at=parse_datetime(pt.get("completed_at"))
        ))

    # Restore Planner Notes
    for pn in backup.get("planner_notes", []):
        db.add(PlannerNote(
            user_id=user_id, date=parse_date(pn["date"]), content=pn["content"]
        ))

    # Restore Pomodoro Sessions
    for ps in backup.get("pomodoro_sessions", []):
        db.add(PomodoroSession(
            user_id=user_id, date=parse_date(ps["date"]), task_name=ps.get("task_name"),
            duration_minutes=ps.get("duration_minutes", 25), completed=ps.get("completed", True)
        ))

    db.commit()
    return {"status": "success", "message": "All user data restored successfully"}

@router.get("/csv/{data_type}")
def export_csv(
    data_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download individual logs as a CSV file."""
    user_id = current_user.id
    output = StringIO()
    writer = csv.writer(output)
    
    if data_type == "fitness":
        logs = db.query(FitnessLog).filter(FitnessLog.user_id == user_id).order_by(FitnessLog.date.desc()).all()
        writer.writerow(["Date", "Workout Type", "Duration (mins)", "Calories Burned", "Exercises", "Notes"])
        for l in logs:
            writer.writerow([l.date, l.workout_type, l.duration_minutes, l.calories_burned, l.exercises, l.notes])
            
    elif data_type == "diet":
        logs = db.query(FoodLog).filter(FoodLog.user_id == user_id).order_by(FoodLog.date.desc()).all()
        writer.writerow(["Date", "Meal Type", "Food Name", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)", "Fiber (g)", "Water (ml)"])
        for l in logs:
            writer.writerow([l.date, l.meal_type, l.food_name, l.calories, l.protein_g, l.carbs_g, l.fat_g, l.fiber_g, l.water_ml])
            
    elif data_type == "study":
        logs = db.query(StudySession).filter(StudySession.user_id == user_id).order_by(StudySession.date.desc()).all()
        writer.writerow(["Date", "Topic ID", "Hours Studied", "Notes"])
        for l in logs:
            writer.writerow([l.date, l.topic_id, l.hours, l.notes])
            
    elif data_type == "sleep":
        logs = db.query(SleepLog).filter(SleepLog.user_id == user_id).order_by(SleepLog.date.desc()).all()
        writer.writerow(["Date", "Sleep Time", "Wake Time", "Hours", "Quality (1-5)", "Notes"])
        for l in logs:
            writer.writerow([l.date, l.sleep_time, l.wake_time, l.hours, l.quality_rating, l.notes])
            
    elif data_type == "habits":
        logs = db.query(HabitLog).filter(HabitLog.user_id == user_id).order_by(HabitLog.date.desc()).all()
        writer.writerow(["Date", "Habit ID", "Completed"])
        for l in logs:
            writer.writerow([l.date, l.habit_id, l.completed])
            
    else:
        raise HTTPException(status_code=400, detail="Invalid data type for CSV export")
        
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=lifeos_{data_type}_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
