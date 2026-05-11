from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime
from app.models.base import Base

class Translation(Base):
    __tablename__ = "translations"
    id = Column(String(6), primary_key=True)
    description = Column(String(255), unique=True, nullable=False)
    vi = Column(Text, nullable=True)
    en = Column(Text, nullable=True)
    kr = Column(Text, nullable=True)
    event_time = Column(DateTime, default=datetime.now)
    event_user = Column(String(50), nullable=False)
