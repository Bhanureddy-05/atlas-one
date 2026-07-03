import time
import threading
import queue
from typing import Callable, Any, Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LifeOS-Scheduler")

class BackgroundScheduler:
    def __init__(self):
        self._task_queue = queue.PriorityQueue()
        self._retry_queue: List[Dict[str, Any]] = []
        self._offline_queue: List[Dict[str, Any]] = []
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def start(self):
        if not self._running:
            self._running = True
            self._thread = threading.Thread(target=self._worker_loop, daemon=True)
            self._thread.start()
            logger.info("Background Services scheduler started successfully.")

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=1.0)
            logger.info("Background Services scheduler stopped.")

    def add_task(self, name: str, task_fn: Callable[[], Any], delay_sec: float = 0, priority: int = 10):
        """Schedule a task to run after delay_sec."""
        run_time = time.time() + delay_sec
        self._task_queue.put((run_time, priority, name, task_fn))
        logger.info(f"Task '{name}' scheduled in {delay_sec}s with priority {priority}.")

    def add_to_offline_queue(self, action_type: str, payload: Dict[str, Any]):
        """Queue calendar or health synchronization events when network is disconnected."""
        self._offline_queue.append({
            "action": action_type,
            "payload": payload,
            "queued_at": time.time()
        })
        logger.info(f"Offline action '{action_type}' queued. Total items in offline queue: {len(self._offline_queue)}")

    def get_offline_queue(self) -> List[Dict[str, Any]]:
        return self._offline_queue

    def clear_offline_queue(self):
        self._offline_queue.clear()

    def _worker_loop(self):
        while self._running:
            try:
                if not self._task_queue.empty():
                    run_time, priority, name, task_fn = self._task_queue.get(block=False)
                    now = time.time()
                    if now >= run_time:
                        try:
                            logger.info(f"Executing task: {name}")
                            task_fn()
                        except Exception as e:
                            logger.error(f"Task '{name}' failed: {e}. Adding to retry queue.")
                            self._handle_failed_task(name, task_fn)
                    else:
                        # Re-queue and sleep briefly
                        self._task_queue.put((run_time, priority, name, task_fn))
                        time.sleep(0.5)
                else:
                    time.sleep(1.0)
            except Exception as e:
                time.sleep(1.0)

    def _handle_failed_task(self, name: str, task_fn: Callable[[], Any], retries: int = 3):
        # Implement task retry with exponential backoff
        self.add_task(f"Retry-{name}", task_fn, delay_sec=15.0, priority=20)


# Global Scheduler Instance
scheduler = BackgroundScheduler()
