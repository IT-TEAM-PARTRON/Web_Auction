from sqlalchemy import Column, String, Integer, DateTime, Text, Numeric, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid
from datetime import datetime

class AuctionParticipant(Base):
    __tablename__ = "auction_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auction_id = Column(String(36), ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    auction = relationship("Auction", back_populates="participants")
    user = relationship("User", back_populates="participated_auctions")