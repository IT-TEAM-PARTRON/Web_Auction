from sqlalchemy import Column, String, Integer, DateTime, Text, Numeric, UUID, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid
from datetime import datetime

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_name = Column(String, nullable=False)
    description = Column(Text)
    # event_time = Column(DateTime, default=False)
    auctions = relationship("Auction", back_populates="category", cascade="all, delete-orphan")
