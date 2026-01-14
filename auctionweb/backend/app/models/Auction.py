from sqlalchemy import Column, String, Integer, DateTime, Text, Numeric, UUID, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid
from datetime import datetime
from app.enums import TypeAuction

class Auction(Base):
    __tablename__ = "auctions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String(36), ForeignKey("categories.category_id", ondelete='CASCADE'), nullable=False)
    auction_type = Column(Enum(TypeAuction), nullable=False, default=TypeAuction.BUY)
    title = Column(String, nullable=False)
    title_vi = Column(String, nullable=False)
    title_ko = Column(String, nullable=False)
    description = Column(Text)
    description_vi = Column(Text)
    description_ko = Column(Text)
    starting_price = Column(Numeric, nullable=False)
    step_price = Column(Numeric, nullable=False)
    image_url = Column(Text)
    file_exel = Column(String)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    status = Column(Integer, nullable=False)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    currency = Column(String)
    bids = relationship("Bid", back_populates="auction", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="auction", cascade="all, delete")
    orders = relationship("Order", back_populates="auction")
    category = relationship("Category", back_populates="auctions")
    participants = relationship("AuctionParticipant", back_populates="auction")
