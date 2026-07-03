from datetime import date
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.auth import get_current_user

router = APIRouter()

class KnowledgeCreate(BaseModel):
    title: str
    content_type: str  # "note", "idea", "research", "quote"
    content: str

class KnowledgeResponse(BaseModel):
    id: int
    title: str
    content_type: str
    content: str
    ai_summary: Optional[str]
    created_at: Any = None  # Allow datetime serialization

    class Config:
        from_attributes = True

@router.get("/", response_model=List[KnowledgeResponse])
def get_knowledge_items(
    content_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(KnowledgeItem).filter(KnowledgeItem.user_id == current_user.id)
    if content_type:
        query = query.filter(KnowledgeItem.content_type == content_type)
    return query.order_by(KnowledgeItem.created_at.desc()).all()

@router.post("/", response_model=KnowledgeResponse, status_code=201)
def create_knowledge_item(
    item_data: KnowledgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Auto-generate a local AI Summary
    summary = f"Summary of {item_data.content_type} '{item_data.title}': "
    content_len = len(item_data.content)
    
    if item_data.content_type == "idea":
        summary += f"Creative idea brainstormed. Length: {content_len} chars. Highlights: " + item_data.content[:100] + ("..." if content_len > 100 else "")
    elif item_data.content_type == "quote":
        summary += f"Inspirational quote indexed. Words: {len(item_data.content.split())}. Author/Content: " + item_data.content[:80]
    elif item_data.content_type == "research":
        summary += f"Scientific/Technical reference review. Length: {content_len} chars. Abstract: " + item_data.content[:120] + ("..." if content_len > 120 else "")
    else:
        summary += f"General study note captured. Details: " + item_data.content[:90] + ("..." if content_len > 90 else "")

    item = KnowledgeItem(
        user_id=current_user.id,
        title=item_data.title,
        content_type=item_data.content_type,
        content=item_data.content,
        ai_summary=summary
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_knowledge_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id, KnowledgeItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    db.delete(item)
    db.commit()
    return {"message": "Knowledge note deleted successfully"}
