import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import user, func
from app.core.database import get_db
from app.models.User import User
from app.models.Bid import Bid
from app.core.auth import get_current_user_id_from_token
from app.enums import UserRole
from starlette.status import HTTP_400_BAD_REQUEST
from app.i18n import _
router = APIRouter()

class UserOut(BaseModel):
    id: str
    username: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    company: Optional[str]
    role: str
    created_at: datetime
    status: int
    bid_count: int 
    
    class Config:
        # orm_mode = True
        from_attributes = True
class UserOutInfo(BaseModel):
    id: str
    username: Optional[str]
    phone_number: Optional[str]
    company: Optional[str]
    email: Optional[str]
    password: Optional[str]
    role: str
    created_at: datetime
    status: int
    bid_count: int 
    
    class Config:
        # orm_mode = True
        from_attributes = True

class UserStatusUpdate(BaseModel):
    status: int
class UserCreate(BaseModel):
    email: str
    username: str
    company: str = None
    password: str
    phone_number: str =None
    role: UserRole = UserRole.USER  # Mặc định là user
    status: int = 1 #mặc định là active

class UserUpdate(BaseModel):
    username: Optional[str] = None
    phone_number: Optional[str] = None
    password : Optional[str] = None
    company: Optional[str] = None

class UsersListOut(BaseModel):
    users: list[UserOut]
    total_users: int

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_from_token)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail=_("User not found", request))
    return user

@router.get("/users", response_model=UsersListOut)
def get_users(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search_text: Optional[str] = Query(None, description="Tìm kiếm theo username hoặc email"),
    sort_by: Optional[str] = Query("created_at", description="Sắp xếp theo: username, email, created_at, bid_count"),
    sort_order: Optional[str] = Query("desc", description="Thứ tự sắp xếp: asc, desc"),
    role: Optional[str] = Query(None, description="Lọc theo role: USER, ADMIN, SUPER_ADMIN"),
    page: int = Query(1, ge=1, description="Số trang"),
    page_size: int = Query(8, ge=1, le=100, description="Số user mỗi trang")
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=403,
            detail=_("You don't have permison watch users!", request)
        )
    
    # Query với join và đếm số bid
    query = db.query(
        User,
        func.count(Bid.id).label('bid_count')
    ).outerjoin(Bid, User.id == Bid.user_id).group_by(User.id)

    if search_text:
        query = query.filter(
            (User.username.ilike(f"%{search_text}%")) | (User.email.ilike(f"%{search_text}%"))
        )
    if role:
        query = query.filter(User.role == role)
    # Sắp xếp
    if sort_by == "username":
        order_col = User.username
    elif sort_by == "email":
        order_col = User.email
    elif sort_by == "bid_count":
        order_col = func.count(Bid.id)
    else:
        order_col = User.created_at
    if sort_order == "asc":
        query = query.order_by(order_col.asc())
    else:
        query = query.order_by(order_col.desc())
    total_users = query.count()
    offset = (page - 1) * page_size
    results = query.offset(offset).limit(page_size).all()
    
    # Chuyển đổi kết quả thành format mong muốn
    users = []
    for user_obj, bid_count in results:
        user_dict = {
            "id": user_obj.id,
            "username": user_obj.username,
            "email": user_obj.email,
            "phone_number": user_obj.phone_number,
            "company": user_obj.company,
            "role": user_obj.role.value,
            "created_at": user_obj.created_at,
            "status": user_obj.status,
            "bid_count": bid_count
        }
        users.append(user_dict)
    
    return {"users": users, "total_users": total_users}

@router.get("/users/{user_id}", response_model=UserOutInfo)
def get_user(
    request: Request,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=_("User not found", request))
    
    # Get bid count for the user
    bid_count = db.query(Bid).filter(Bid.user_id == user_id).count()
    
    # Return user with bid count
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "phone_number": user.phone_number,
        "company": user.company,
        "role": user.role.value,
        "created_at": user.created_at,
        "status": user.status,
        "bid_count": bid_count
    }

@router.put("/users/create", response_model=UserOut)
def create_user(
    request: Request,
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail=_("Permission denied", request))
    
    # Check email already exists
    existing_user = db.query(User).filter(
        (User.email == data.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=_("Email already exists", request))

    new_user = User(
        username=data.username.strip(),
        phone_number=data.phone_number.strip() if data.phone_number else None,
        password=data.password.strip(),
        created_at=datetime.now(),
        company=data.company.strip() if data.company else None,
        email=data.email.strip()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "phone_number": new_user.phone_number,
        "company": new_user.company,
        "role": new_user.role.value,
        "created_at": new_user.created_at,
        "status": new_user.status,
        "bid_count": 0
    }

@router.patch("/users/{user_id}/status")
def set_user_status(
    request: Request,
    user_id: str,
    data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail=_("Permission denied", request))
    user = db.query(User).filter(User.id == user_id).first()

    if current_user.role == UserRole.ADMIN and (user.role == UserRole.SUPER_ADMIN or user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail=_("Admin cannot modify Super Admin, Admin information", request))
    
    if current_user.role == UserRole.SUPER_ADMIN and user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail=_("Super Admin cannot modify Super Admin information", request))
    
    if not user:
        raise HTTPException(status_code=404, detail=_("User not found", request))
    if data.status not in (0, 1):
        raise HTTPException(status_code=400, detail=_("Status must be 0 (disactive) or 1 (active)", request))
    user.status = data.status
    db.commit()
    return {"message": _("User status updated to {data.status}.", request)}

@router.put("/users/{user_id}")
def update_user(
    request: Request,
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=_("User not found", request))

    # Nếu là user thường -> chỉ được sửa thông tin của chính mình
    if current_user.role == UserRole.USER and current_user.id != user.id:
        raise HTTPException(status_code=403, detail=_("You can only modify your own information", request))

    # Nếu là admin -> cấm sửa thông tin SUPER_ADMIN
    if current_user.role == UserRole.ADMIN and user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail=_("Admin cannot modify Super Admin information", request))

    # Update các trường cho phép
    if data.username is not None:
        user.username = data.username.strip()

    if data.phone_number is not None:
        user.phone_number = data.phone_number.strip()
    
    if data.company is not None:
        user.company = data.company.strip()

    if data.password is not None:
        user.password = data.password.strip()

    db.commit()
    db.refresh(user)

    return {"message": _("User updated successfully.", request)}

@router.delete("/users/{user_id}")
def delete_user(
    request: Request,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail=_("Permission denied", request))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=_("User not found", request))

    if current_user.role == UserRole.ADMIN and (user.role == UserRole.SUPER_ADMIN or user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail=_("Admin cannot delete Super Admin information", request))

    if current_user.role == UserRole.SUPER_ADMIN and user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail=_("Super Admin cannot delete Super Admin information", request))
    db.delete(user)
    db.commit() 
    return {"message": _("User deleted successfully.", request)}