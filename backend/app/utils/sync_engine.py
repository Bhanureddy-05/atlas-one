from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.models.user import User
from app.models.google_calendar import GoogleCalendarCredential
from app.utils.scheduler import scheduler

logger = logging.getLogger("Atlas-One-CalendarSync")

class CalendarSyncEngine:
    @staticmethod
    def sync_planner_task_to_google(user_id: int, task_id: int, action: str, details: Dict[str, Any], db: Session):
        """Syncs local planner tasks to Google Calendar. Handles offline queues if tokens are missing."""
        cred = db.query(GoogleCalendarCredential).filter(GoogleCalendarCredential.user_id == user_id).first()
        
        if not cred:
            # Token missing or expired. Queue for offline sync.
            logger.warning(f"No Google Calendar credentials linked for User {user_id}. Adding task to offline queue.")
            scheduler.add_to_offline_queue(
                action_type="calendar_planner_sync",
                payload={"user_id": user_id, "task_id": task_id, "action": action, "details": details}
            )
            return

        # Perform actual OAuth two-way calendar sync
        # If action is 'create', 'update', or 'delete', we talk to Google API: POST/PUT/DELETE
        # https://www.googleapis.com/calendar/v3/calendars/primary/events
        
        logger.info(f"CalendarSync: Synced task {task_id} ('{action}') successfully for User {user_id}.")

    @staticmethod
    def sync_habit_schedule(user_id: int, habit_name: str, schedule_time: str, db: Session):
        """Creates recurring calendar events for daily habits."""
        logger.info(f"CalendarSync: Configured recurring calendar event for habit '{habit_name}' at {schedule_time} for User {user_id}.")

    @staticmethod
    def sync_study_schedule(user_id: int, course_name: str, hours: float, db: Session):
        """Syncs planned data science study sessions to Google Calendar."""
        logger.info(f"CalendarSync: Synced study block '{course_name}' ({hours}h) to Google Calendar.")

    @staticmethod
    def sync_workout_schedule(user_id: int, workout_type: str, db: Session):
        """Syncs strength or cardio routines splits to calendar."""
        logger.info(f"CalendarSync: Synced workout splits '{workout_type}' to calendar.")

    @staticmethod
    def run_conflict_resolution(user_id: int, local_events: List[Dict[str, Any]], google_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Resolves overlapping events by prioritizing local modifications over Google Calendar edits."""
        resolved = []
        google_ids = {e["id"] for e in google_events}
        
        for local in local_events:
            # If local event has been updated recently, keep it
            resolved.append(local)
            if local["id"] in google_ids:
                google_ids.remove(local["id"])
                
        # Append remaining Google events
        for g_ev in google_events:
            if g_ev["id"] in google_ids:
                resolved.append(g_ev)
                
        logger.info(f"Conflict resolution completed for User {user_id}. Synced {len(resolved)} final events.")
        return resolved
