from email import message
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import user
from app.core.database import get_db
from app.models.Bid import Bid
from app.models.Auction import Auction
from app.models.User import User
from pydantic import BaseModel
from datetime import datetime
from app.core.auth import get_current_user_id_from_token
from app.models.Notification import Notification
from app.i18n import _
import json

router = APIRouter()

class NotificationOut(BaseModel):
    id: str
    user_id: str
    auction_id: str
    message: str
    notification_type: str | None = None
    is_read: bool
    created_at: datetime

class Notification_read(BaseModel):
    is_read:bool

@router.get("/notifications", response_model=list[NotificationOut])
def get_notifications(
    request: Request,
    db: Session = Depends(get_db), 
    user_id: str = Depends(get_current_user_id_from_token)
):
    lang = request.state.locale  # "en", "vi", "ko"
    notifications = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    result = []
    for n in notifications:
        if lang == "vi" and hasattr(n, "message_vi"):
            message = n.message_vi or n.message
        elif lang == "ko" and hasattr(n, "message_ko"):
            message = n.message_ko or n.message
        else:
            message = n.message
        result.append({
            "id": n.id,
            "user_id": n.user_id,
            "auction_id": n.auction_id,
            "message": message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at
        })
    return result

@router.post("/set_read")
def set_read_notification(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_from_token),
    data: Notification_read = None
    ):
    notifications = db.query(Notification).filter(Notification.user_id == user_id).all()
    
    for notification in notifications:
        notification.is_read = True
    
    db.commit()
    return {"detail": _("Set read successful!", request)}


@router.post("/notifications/mark-void-read")
def mark_void_notifications_read(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_from_token)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.notification_type == "void_bid",
        Notification.is_read == False
    ).all()
    
    for notification in notifications:
        notification.is_read = True
    
    db.commit()
    return {"detail": _("Set read successful!", request)}


 