from datetime import date
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.sharing import FamilyGroup, GroupMembership, GroupInvitation, SharedGoal
from app.auth import get_current_user

router = APIRouter()

# --- Schemas ---
class GroupCreate(BaseModel):
    name: str

class InviteRequest(BaseModel):
    group_id: int
    email: str

class SharedGoalCreate(BaseModel):
    group_id: int
    title: str
    description: Optional[str] = None
    target_value: int
    category: str

class GroupResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: Any = None

    class Config:
        from_attributes = True

class MemberResponse(BaseModel):
    id: int
    user_id: int
    username: str
    role: str

    class Config:
        from_attributes = True

# --- API Endpoints ---
from typing import Any

@router.post("/groups", response_model=GroupResponse)
def create_family_group(
    payload: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new Family sharing group."""
    group = FamilyGroup(name=payload.name, owner_id=current_user.id)
    db.add(group)
    db.flush()

    # Automatically add owner membership
    membership = GroupMembership(group_id=group.id, user_id=current_user.id, role="owner")
    db.add(membership)
    
    # Award 20 XP for setting up team
    current_user.xp += 20
    if current_user.xp >= current_user.level * 100:
        current_user.xp -= current_user.level * 100
        current_user.level += 1

    db.commit()
    db.refresh(group)
    return group

@router.get("/groups", response_model=List[GroupResponse])
def get_user_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List groups that the user is a member of."""
    memberships = db.query(GroupMembership).filter(GroupMembership.user_id == current_user.id).all()
    group_ids = [m.group_id for m in memberships]
    return db.query(FamilyGroup).filter(FamilyGroup.id.in_(group_ids)).all()

@router.get("/groups/{group_id}/members")
def get_group_members(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all members and their roles inside a sharing group."""
    # Auth check
    memb = db.query(GroupMembership).filter(GroupMembership.group_id == group_id, GroupMembership.user_id == current_user.id).first()
    if not memb:
        raise HTTPException(status_code=403, detail="Not authorized to view group members")
        
    memberships = db.query(GroupMembership).filter(GroupMembership.group_id == group_id).all()
    result = []
    for m in memberships:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append({
            "membership_id": m.id,
            "user_id": m.user_id,
            "username": user.username if user else "Unknown",
            "full_name": user.full_name if user else "Unknown",
            "role": m.role
        })
    return result

@router.post("/invite")
def invite_user_to_group(
    payload: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an invitation email to join a family sharing group."""
    # Member authorization check (must be admin/owner to invite)
    memb = db.query(GroupMembership).filter(
        GroupMembership.group_id == payload.group_id,
        GroupMembership.user_id == current_user.id
    ).first()
    if not memb or memb.role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Only owners and admins can issue invitations")

    # Save invitation record
    invitation = GroupInvitation(group_id=payload.group_id, email=payload.email.strip().lower())
    db.add(invitation)
    db.commit()
    
    # In a full mail setup, this dispatches a sign-up invite link.
    return {"message": f"Invitation queued for {payload.email}", "status": "pending"}

@router.get("/invitations", response_model=List[Dict[str, Any]])
def get_pending_invitations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch pending invitations matching the user's registered email address."""
    invites = db.query(GroupInvitation).filter(
        GroupInvitation.email == current_user.email.lower(),
        GroupInvitation.status == "pending"
    ).all()
    
    result = []
    for invite in invites:
        group = db.query(FamilyGroup).filter(FamilyGroup.id == invite.group_id).first()
        result.append({
            "invitation_id": invite.id,
            "group_name": group.name if group else "Unknown Group",
            "group_id": invite.group_id,
            "date_sent": invite.created_at
        })
    return result

@router.post("/invitations/{invite_id}/respond")
def respond_to_invitation(
    invite_id: int,
    accept: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept or decline a pending group invitation."""
    invite = db.query(GroupInvitation).filter(
        GroupInvitation.id == invite_id,
        GroupInvitation.email == current_user.email.lower()
    ).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
        
    if accept:
        invite.status = "accepted"
        # Add group membership
        membership = GroupMembership(group_id=invite.group_id, user_id=current_user.id, role="member")
        db.add(membership)
        db.commit()
        return {"message": "Group invitation accepted", "joined": True}
    else:
        invite.status = "declined"
        db.commit()
        return {"message": "Group invitation declined", "joined": False}

@router.post("/goals", response_model=Dict[str, Any])
def create_shared_goal(
    payload: SharedGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup a shared team/group target."""
    # Check permissions
    memb = db.query(GroupMembership).filter(
        GroupMembership.group_id == payload.group_id,
        GroupMembership.user_id == current_user.id
    ).first()
    if not memb or memb.role in ["read_only"]:
        raise HTTPException(status_code=403, detail="Insufficient group permissions to create goals")

    goal = SharedGoal(
        group_id=payload.group_id,
        title=payload.title,
        description=payload.description,
        target_value=payload.target_value,
        category=payload.category
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return {"message": "Shared team goal established!", "goal_id": goal.id}

@router.get("/groups/{group_id}/goals")
def list_shared_goals(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve group-wide achievements and shared progress trackers."""
    memb = db.query(GroupMembership).filter(GroupMembership.group_id == group_id, GroupMembership.user_id == current_user.id).first()
    if not memb:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return db.query(SharedGoal).filter(SharedGoal.group_id == group_id).all()
