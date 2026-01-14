# app/models/notification.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UUID
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(36), ForeignKey("users.id", ondelete='CASCADE'), nullable=False, )
    auction_id = Column(String(36), ForeignKey("auctions.id"), nullable=False)
    message = Column(String, nullable=False)
    message_vi = Column(String, nullable=False)
    message_ko = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="notifications")
    auction = relationship("Auction", back_populates="notifications", cascade="all, delete")