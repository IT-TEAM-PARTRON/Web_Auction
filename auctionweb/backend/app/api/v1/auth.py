import enum
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.User import User
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.core.config import  SECRET_KEY, ALGORITHM
from app.enums import UserRole
from app.i18n import _
from app.services.email_service import email_service

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    username: str
    email: str
    user_id: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyResetTokenRequest(BaseModel):
    token: str
class RegisterRequest(BaseModel):
    email: str
    username: str
    company: str
    password: str
    phone_number: str
    role: UserRole = UserRole.USER  # Mặc định là user
    status: int = 1 #mặc định là active

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ForgotPasswordResponse(BaseModel):
    message: str

class ResetPasswordResponse(BaseModel):
    message: str

# def verify_password(plain_password, hashed_password):
#     return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# reset token
def create_reset_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": "reset"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or user.password != login_data.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_("Incorrect email or password", request))
    if user.status != 1 and user:
        raise HTTPException(status_code=403, detail=_("User is inactive or banned", request))
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    role = UserRole(user.role).name.lower()
    username = user.username
    email = user.email
    user_id = user.id
    return {"access_token": access_token,"refresh_token": refresh_token, "token_type": "bearer", "role":role, "username":username, "email": email, "user_id": user_id }

@router.post("/register", response_model=Token)
def register(request: Request, register_data: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == register_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail=_("Account already registered", request))
    
    user = User(
        email=register_data.email,
        username = register_data.username,
        phone_number = register_data.phone_number,
        company = register_data.company,
        created_at = datetime.now(),
        password = register_data.password,
        role = register_data.role.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})
    role = UserRole(user.role).name.lower()
    username = user.username
    email = user.email
    user_id = user.id  # Thêm user_id
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": role,
        "username": username,
        "email": email,
        "user_id": user_id  # Thêm user_id vào response
    }

@router.post("/refresh-token")
def refresh_token(request: Request, refresh_data: RefreshRequest):
    try:
        payload = jwt.decode(refresh_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail=_("Invalid refresh token", request))
        user_id = payload.get("user_id")
        email = payload.get("sub")
        new_access_token = create_access_token(data={"sub": email, "user_id": user_id})
        return {"access_token": new_access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail=_("Invalid refresh token", request))

# quên mật khẩu
@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    request: Request, 
    forgot_data: ForgotPasswordRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Gửi email chứa reset token để reset mật khẩu
    """
    user = db.query(User).filter(User.email == forgot_data.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail= _("User not found", request))
    
    if user.status != 1:
        return {"message": _("User is inactive or banned", request)}
    
    # Tạo reset token với thời hạn 1 giờ
    reset_token = create_reset_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(hours=1)
    )
    
    # task gửi email vào background
    background_tasks.add_task(
        send_reset_email_task,
        email=user.email,
        reset_token=reset_token,
        username=user.username
    )
    
    return {"message": _("If the email exists, a reset link has been sent", request)}

def send_reset_email_task(email: str, reset_token: str, username: str = None):
    """
    Background task để gửi email reset password
    """
    try:
        email_sent = email_service.send_reset_password_email(
            email=email,
            reset_token=reset_token,
            username=username
        )
        
        if not email_sent:
            print(f"Warning: Failed to send reset email to {email}")
            print(f"Reset token: {reset_token}")
    except Exception as e:
        print(f"Error in background email task: {e}")

# reset mật khẩu
@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(request: Request, reset_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset mật khẩu sử dụng reset token
    """
    try:
        # Decode reset token
        payload = jwt.decode(reset_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Kiểm tra loại token
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail=_("Invalid reset token", request))
        
        user_id = payload.get("user_id")
        email = payload.get("sub")
        
        if not user_id or not email:
            raise HTTPException(status_code=400, detail=_("Invalid reset token", request))
        
        # Tìm user
        user = db.query(User).filter(User.id == user_id, User.email == email).first()
        
        if not user:
            raise HTTPException(status_code=400, detail=_("User not found", request))
        
        if user.status != 1:
            raise HTTPException(status_code=400, detail=_("User is inactive", request))
        
        user.password = reset_data.new_password
        
        db.commit()
        
        return {"message": _("Password has been reset successfully", request)}
        
    except JWTError:
        raise HTTPException(status_code=400, detail=_("Invalid or expired reset token", request))
    except Exception as e:
        raise HTTPException(status_code=500, detail=_("An error occurred while resetting password", request))

#verify reset token (optional)
@router.post("/verify-reset-token")
def verify_reset_token(request: Request, token_data: VerifyResetTokenRequest):
    """
    Verify reset token có hợp lệ không
    """
    try:
        payload = jwt.decode(token_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail=_("Invalid reset token", request))
        
        return {"valid": True, "email": payload.get("sub")}
        
    except JWTError:
        raise HTTPException(status_code=400, detail=_("Invalid or expired reset token", request))

