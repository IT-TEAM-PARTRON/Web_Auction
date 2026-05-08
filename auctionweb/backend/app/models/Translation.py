from sqlalchemy import Column, String, Integer, DateTime, Text, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Translation(Base):
    __tablename__ = "translations"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    key = Column(String(255), unique=True, nullable=False)
    vi = Column(Text, nullable=True)
    en = Column(Text, nullable=True)
    kr = Column(Text, nullable=True)
    event_time = Column(DateTime, default=datetime.now)
    event_user = Column(String(50), nullable=False)
