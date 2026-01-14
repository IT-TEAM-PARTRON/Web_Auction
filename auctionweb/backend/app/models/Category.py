from sqlalchemy import Column, String,Text, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
import uuid

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_name = Column(String, nullable=False)
    category_name_vi = Column(String, nullable=False)
    category_name_ko = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=False)
    auctions = relationship("Auction", back_populates="category", cascade="all, delete-orphan")
