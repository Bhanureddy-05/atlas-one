from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from abc import ABC, abstractmethod

from app.database import get_db
from app.models.user import User
from app.models.smartwatch import SmartwatchSync
from app.auth import get_current_user

router = APIRouter()

# ── Smartwatch Sync Abstraction Layer (Adapter Pattern) ────────────────────
class SmartwatchSyncProvider(ABC):
    @abstractmethod
    def sync_metrics(self, access_token: Optional[str]) -> Dict[str, Any]:
        """Fetch steps, calories burned, average heart rate, and sleep duration from smartwatch API."""
        pass


class GoogleFitProvider(SmartwatchSyncProvider):
    def sync_metrics(self, access_token: Optional[str]) -> Dict[str, Any]:
        if not access_token:
            return {"status": "auth_required", "message": "Google Fit credentials not linked"}
        # Mock actual API extraction logic
        return {
            "status": "success",
            "provider": "google_fit",
            "steps": 9420,
            "calories_burned": 520,
            "heart_rate_avg": 72,
            "sleep_hours": 7.5
        }


class AppleHealthProvider(SmartwatchSyncProvider):
    def sync_metrics(self, access_token: Optional[str]) -> Dict[str, Any]:
        # Apple Health is client-side based (iOS SDK), synced via frontend payload
        return {
            "status": "success",
            "provider": "apple_health",
            "steps": 10500,
            "calories_burned": 610,
            "heart_rate_avg": 68,
            "sleep_hours": 8.0
        }


class FitbitProvider(SmartwatchSyncProvider):
    def sync_metrics(self, access_token: Optional[str]) -> Dict[str, Any]:
        if not access_token:
            return {"status": "auth_required", "message": "Fitbit credentials not linked"}
        return {
            "status": "success",
            "provider": "fitbit",
            "steps": 8900,
            "calories_burned": 480,
            "heart_rate_avg": 75,
            "sleep_hours": 6.8
        }


class GarminProvider(SmartwatchSyncProvider):
    def sync_metrics(self, access_token: Optional[str]) -> Dict[str, Any]:
        if not access_token:
            return {"status": "auth_required", "message": "Garmin credentials not linked"}
        return {
            "status": "success",
            "provider": "garmin",
            "steps": 12100,
            "calories_burned": 720,
            "heart_rate_avg": 64,
            "sleep_hours": 7.2
        }


# ── Smartwatch Manager ─────────────────────────────────────────────────────
class SmartwatchManager:
    _providers = {
        "google_fit": GoogleFitProvider(),
        "apple_health": AppleHealthProvider(),
        "fitbit": FitbitProvider(),
        "garmin": GarminProvider()
    }

    @classmethod
    def get_provider(cls, name: str) -> SmartwatchSyncProvider:
        provider = cls._providers.get(name)
        if not provider:
            raise HTTPException(status_code=400, detail=f"Unsupported smartwatch provider: {name}")
        return provider


# ── API Endpoints ──────────────────────────────────────────────────────────
class SmartwatchSyncRequest(BaseModel):
    provider: str
    access_token: Optional[str] = None

@router.get("/status", response_model=List[Dict[str, Any]])
def get_sync_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve history of active fitness smartwatch syncs."""
    syncs = db.query(SmartwatchSync).filter(SmartwatchSync.user_id == current_user.id).all()
    
    # Return active providers and sync statuses
    result = []
    providers = ["google_fit", "apple_health", "fitbit", "garmin"]
    for p in providers:
        match = next((s for s in syncs if s.provider == p), None)
        result.append({
            "provider": p,
            "linked": match is not None,
            "last_sync": match.last_sync_time.isoformat() if match else None,
            "status": match.sync_status if match else "disconnected",
            "data": match.metrics_data if match else None
        })
    return result

@router.post("/sync")
def trigger_smartwatch_sync(
    payload: SmartwatchSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Synchronize fitness logs from selected wearables."""
    provider_name = payload.provider.lower()
    provider = SmartwatchManager.get_provider(provider_name)
    
    # Execute synchronization
    sync_result = provider.sync_metrics(payload.access_token)
    
    # Save/Update sync entry in DB
    existing_sync = db.query(SmartwatchSync).filter(
        SmartwatchSync.user_id == current_user.id,
        SmartwatchSync.provider == provider_name
    ).first()
    
    status_str = "success" if sync_result.get("status") == "success" else "auth_required"
    
    if not existing_sync:
        existing_sync = SmartwatchSync(
            user_id=current_user.id,
            provider=provider_name,
            sync_status=status_str,
            metrics_data=sync_result if status_str == "success" else None
        )
        db.add(existing_sync)
    else:
        existing_sync.sync_status = status_str
        existing_sync.metrics_data = sync_result if status_str == "success" else None
        
    db.commit()
    db.refresh(existing_sync)
    
    return {
        "message": f"Sync with {payload.provider} executed.",
        "status": status_str,
        "payload": sync_result
    }
