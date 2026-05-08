from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.User import User
from app.models.Translation import Translation
from app.core.auth import get_current_user_id_from_token
from app.i18n import _
from app.enums import UserRole
router = APIRouter()

class TranslationIn(BaseModel):
    key: str
    vi: Optional[str]
    en: Optional[str]
    kr: Optional[str]
    event_user: str
class TranslationOut(BaseModel):
    id: str
    key: str
    value: Optional[str]

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_from_token)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail=_("User not found", request))
    return user

# get all list translations
@router.get("/translations")
def get_translations(
    request: Request,
    db: Session = Depends(get_db)
):
    lang = request.state.locale
    db_lang = 'kr' if lang == 'ko' else lang
    translations = db.query(Translation).all()
    result = {}
    for t in translations:
        val = getattr(t, db_lang, None) or t.en or ""
        result[t.key] = val
    return {
        "data": result
    }

@router.post("/translations/create", response_model=TranslationOut)
def create_translation(
    request: Request,
    data: TranslationIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=403,
            detail=_("You don't have permison create translations!", request)
        )
    existing_translation = db.query(Translation).filter(Translation.key == data.key).first()
    if existing_translation:
        raise HTTPException(
            status_code=400,
            detail=_("Key already exists", request)
        )
    translation = Translation(
        key=data.key,
        vi=data.vi,
        en=data.en,
        kr=data.kr,
        event_user=data.event_user
    )
    db.add(translation)
    db.commit()
    db.refresh(translation)
    return translation

@router.put("/translations/update", response_model=TranslationOut)
def update_translation(
    request: Request,
    data: TranslationIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=403,
            detail=_("You don't have permison update translations!", request)
        )
    translation = db.query(Translation).filter(Translation.key == data.key).first()
    if not translation:
        raise HTTPException(status_code=404, detail=_("Translation not found", request))
    translation.vi = data.vi
    translation.en = data.en
    translation.kr = data.kr
    translation.event_user = data.event_user
    db.commit()
    db.refresh(translation)
    return translation