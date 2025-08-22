from sqlalchemy import Column, String, Integer, DateTime, Enum
from sqlalchemy.orm import relationship
import uuid
from app.models.base import Base
from app.enums import UserRole

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(50), nullable=False)
    company = Column(String(100), nullable=False)
    phone_number = Column(String(10), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    created_at = Column(DateTime, nullable=False)
    status = Column(Integer, nullable=False, default=1)
    # Relationships
    # bids = relationship("Bid", back_populates="user")
    bids = relationship("Bid", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
