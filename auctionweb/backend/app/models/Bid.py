from sqlalchemy import Column, Numeric, DateTime, ForeignKey, UUID, Text, String, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid
from datetime import datetime

class Bid(Base):
    __tablename__ = "bids"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auction_id = Column(String(36), ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bid_amount = Column(Numeric, nullable=False)
    file = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    note = Column(Text)
    address = Column(String)
    is_winner = Column(Boolean, default=False)
    status = Column(String, default="VALID")
    void_reason = Column(Text, nullable=True)
    voided_at = Column(DateTime, nullable=True)
    voided_by = Column(String(36), nullable=True)
    # Quan hệ ngược về User và Auction
    auction = relationship("Auction", back_populates="bids")
    user = relationship("User", back_populates="bids")
