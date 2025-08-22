import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import user, func
from app.core.database import get_db
from app.models.Category import Category
from app.models.User import User
from app.core.auth import get_current_user_id_from_token
from app.enums import UserRole
from starlette.status import HTTP_400_BAD_REQUEST
from app.i18n import _
router = APIRouter()

class CategoryOut(BaseModel):
    category_id: str
    category_name: str
    description: str
    class Config:
        # orm_mode = True
        from_attributes = True
class CategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    description: Optional[str] = None

class CategoryCreate(BaseModel):
    category_name: str
    description: str

class CategoryListOut(BaseModel):
    Categories: list[CategoryOut]
    total_categories: int
def get_current_user(
    request: Request,       
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_from_token)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail=_("User not found", request))
    return user

@router.get("/categories", response_model=CategoryListOut)
def get_categories(
    db: Session = Depends(get_db),
    search_text: Optional[str] = Query(None, description="Tìm kiếm theo tên danh mục"),
    sort_order: Optional[str] = Query("desc", description="Thứ tự sắp xếp: asc hoặc desc"),
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(8, ge=1, le=100, description="Số danh mục mỗi trang")
):
    # Base query
    query = db.query(Category)

    # Tìm kiếm theo tên danh mục
    if search_text:
        query = query.filter(Category.category_name.ilike(f"%{search_text}%"))
    # Áp dụng thứ tự sắp xếp
    if sort_order.lower() == "asc":
        query = query.order_by(Category.category_name.asc())
    else:
        query = query.order_by(Category.category_name.desc())

    # Đếm tổng số danh mục
    total_categories = query.count()

    # Phân trang
    offset = (page - 1) * page_size
    categories = query.offset(offset).limit(page_size).all()

    # Định dạng dữ liệu trả về
    category_list = []
    for category in categories:
        category_list.append({
            "category_id": category.category_id,
            "category_name": category.category_name,
            "description": category.description
        })

    return {
        "Categories": category_list,
        "total_categories": total_categories
    }

@router.post("/categories", response_model=CategoryOut)
def create_category(
    request: Request,
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=_("You don't have permission to create category!", request)
        )
    category = db.query(Category).filter(Category.category_name == data.category_name.strip()).first()
    if category:
        raise HTTPException(status_code=400, detail=_("Category name already exists", request))
    else:
        category = Category(
            category_name=data.category_name.strip(),
            description=data.description.strip()
        )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/categories/{category_id}")
def update_category(
    request: Request,
    category_id: str,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail=_("Permission denied", request))
    category = db.query(Category).filter(Category.category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=_("Category not found", request))
    if data.category_name is not None:
        category.category_name = data.category_name.strip()
    if data.description is not None:
        category.description = data.description.strip()

    db.commit()
    db.refresh(category)

    return {"message": _("Category updated successfully.", request)}

@router.delete("/categories/{category_id}")
def delete_category(
    request: Request,
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail=_("Permission denied", request))
    category = db.query(Category).filter(Category.category_id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=_("Category not found", request))
    db.delete(category)
    db.commit()
    return {"message": _("Category deleted successfully.", request)}