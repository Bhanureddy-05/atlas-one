from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", foreign_keys=[owner_id])
    memberships = relationship("GroupMembership", back_populates="group", cascade="all, delete-orphan")
    invitations = relationship("GroupInvitation", back_populates="group", cascade="all, delete-orphan")
    shared_goals = relationship("SharedGoal", back_populates="group", cascade="all, delete-orphan")


class GroupMembership(Base):
    __tablename__ = "group_memberships"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("family_groups.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(50), default="member")  # "owner", "admin", "member", "read_only"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("FamilyGroup", back_populates="memberships")
    user = relationship("User", back_populates="group_memberships")


class GroupInvitation(Base):
    __tablename__ = "group_invitations"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("family_groups.id"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    status = Column(String(50), default="pending")  # "pending", "accepted", "declined"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("FamilyGroup", back_populates="invitations")


class SharedGoal(Base):
    __tablename__ = "shared_goals"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("family_groups.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    target_value = Column(Integer, default=100)
    current_value = Column(Integer, default=0)
    category = Column(String(100), default="fitness")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("FamilyGroup", back_populates="shared_goals")
