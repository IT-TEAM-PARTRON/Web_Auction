# app/models/order.py
from sqlalchemy import Column, Numeric, DateTime, ForeignKey, UUID, Enum, String
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid
from datetime import datetime
from app.enums import OrderStatus

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    auction_id = Column(String(36), ForeignKey("auctions.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric, nullable=False)
    status = Column(Enum(OrderStatus), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    auction = relationship("Auction", back_populates="orders")
    user = relationship("User", back_populates="orders")