from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.User import User
from app.models.Translation import Translation
from app.core.auth import get_current_user_id_from_token
from app.i18n import _
from app.enums import UserRole
router = APIRouter()

class TranslationIn(BaseModel):
    description: str
    vi: Optional[str]
    en: Optional[str]
    kr: Optional[str]
    event_user: str

class TranslationBulkUpdate(BaseModel):
    translations: List[TranslationIn]
class TranslationOut(BaseModel):
    id: str
    description: str
    value: Optional[str]

class TranslationOutList(BaseModel):
    id: str
    description: str
    vi: Optional[str]
    en: Optional[str]
    kr: Optional[str]
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
        result[t.description] = val
    return {
        "data": result
    }

@router.get("/translations/list", response_model=list[TranslationOutList])
def get_translations_list(
    request: Request,
    db: Session = Depends(get_db)
):
    translations = db.query(Translation).order_by(Translation.description.asc()).all()
    result = []
    for t in translations:
        result.append(
            TranslationOutList(
                id=t.id,
                description=t.description,
                vi=t.vi,
                en=t.en,
                kr=t.kr
            )
        )

    return result

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
    existing_translation = db.query(Translation).filter(Translation.description == data.description).first()
    if existing_translation:
        raise HTTPException(
            status_code=400,
            detail=_("Description already exists", request)
        )
    translation = Translation(
        description=data.description,
        vi=data.vi,
        en=data.en,
        kr=data.kr,
        event_user=data.event_user
    )
    db.add(translation)
    db.commit()
    db.refresh(translation)
    return translation

@router.put("/translations/update")
def update_translation(
    request: Request,
    data: TranslationIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # log data FE send to BE
    print("Update translation data:", data)
    try:
        if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=403,
                detail=_("You don't have permison update translations!", request)
            )
        translation = db.query(Translation).filter(Translation.description == data.description).first()
        if not translation:
            raise HTTPException(status_code=404, detail=_("Translation not found", request))
        translation.vi = data.vi
        translation.en = data.en
        translation.kr = data.kr
        translation.event_user = data.event_user
        db.commit()
        db.refresh(translation)
        return translation

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=_("Error while updating translations: {error}", request).format(error=str(e))
        )

@router.put("/translations/bulk-update")
def bulk_update_translation(
    request: Request,
    data: TranslationBulkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:

        if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=403,
                detail=_("You don't have permission update translations!", request)
            )

        updated_count = 0
        not_found = []

        for item in data.translations:

            translation = (
                db.query(Translation)
                .filter(Translation.description == item.description)
                .first()
            )

            if not translation:
                not_found.append(item.description)
                continue

            translation.vi = item.vi
            translation.en = item.en
            translation.kr = item.kr
            translation.event_user = item.event_user

            updated_count += 1

        db.commit()

        return {
            "message": _("Update success", request),
            "updated_count": updated_count,
            "not_found": not_found
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=_("Error while updating translations: {error}", request).format(
                error=str(e)
            )
        )