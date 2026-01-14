from email import message
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.Bid import Bid
from app.models.Auction import Auction
from app.models.User import User
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.core.auth import get_current_user_id_from_token
from app.models.Notification import Notification
from app.i18n import _
from app.enums import UserRole
from fastapi.responses import FileResponse
import os
from app.models.AuctionParticipant import AuctionParticipant
from sqlalchemy.exc import SQLAlchemyError

router = APIRouter()

class BidCreate(BaseModel):
    auction_id: str
    bid_amount: float
    file: Optional[str] = None
    address: Optional[str] = None
    note: Optional[str] = None

class BidOut(BaseModel):
    id: str
    auction_id: str
    user_id: str
    bid_amount: float
    file: Optional[str] = None
    created_at: datetime
    address: Optional[str] = None
    note: Optional[str] = None
    is_winner: bool = False
    class Config:
        from_attributes = True

class BidWithAuctionOut(BaseModel):
    id: str
    auction_id: str
    user_id: str
    bid_amount: float
    file: Optional[str] = None
    created_at: datetime
    address: Optional[str] = None
    note: Optional[str] = None
    is_winner: bool = False
    currency: Optional[str] = None
    # Auction information
    auction_title: str
    auction_starting_price: float
    auction_step_price: float
    auction_start_time: datetime
    auction_end_time: datetime
    # auction_status: int
    
    class Config:
        from_attributes = True

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
UPLOAD_IMAGE_DIR = os.path.join(BASE_DIR, 'uploads', 'images')
UPLOAD_EXCEL_DIR = os.path.join(BASE_DIR, 'uploads', 'excels')

@router.post("/bids", response_model=BidOut)
def create_bid(
    request: Request,
    bid_in: BidCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_from_token)
):
    try:
        auction = db.query(Auction).filter(Auction.id == bid_in.auction_id).first()
        if not auction:
            raise HTTPException(status_code=404, detail=_("Auction not found", request))
        
        now = datetime.now()
        if auction.start_time > now or auction.end_time < now:
            raise HTTPException(status_code=400, detail=_("Auction is not active", request))
        
        user = db.query(User).filter(User.id == user_id, User.status == 1).first()
        if not user:
            raise HTTPException(status_code=403, detail=_("User not allowed to bid", request))
                 
        if user.role == UserRole.SUPER_ADMIN or user.role == UserRole.ADMIN:
            raise HTTPException(status_code=403, detail=_("Admin or Super Admin not allowed to bid", request))
        
        if float(bid_in.bid_amount) < float(auction.starting_price):
            raise HTTPException(
                status_code=400,
                detail=_("Bid amount must be at least the starting price", request)
            )
        #Kiểm tra xem user có được mời tham gia đấu giá không
        invited = db.query(AuctionParticipant).filter(AuctionParticipant.auction_id == bid_in.auction_id, AuctionParticipant.user_id == user_id).first()
        if not invited:
            raise HTTPException(status_code=403, detail=_("User not invited to bid", request))
        
        # Kiểm tra user đã đặt bid cho auction này chưa
        existing_bid = db.query(Bid).filter(Bid.auction_id == bid_in.auction_id, Bid.user_id == user_id).first()
        
        # khoảng cách giá cũ và giá mới tối thiểu phải >= bước giá của acution_id
        if existing_bid and abs(float(bid_in.bid_amount) - float(existing_bid.bid_amount)) < float(auction.step_price):
            raise HTTPException(
                status_code=400,
                detail=_("Your new price must be at least one price step away from your old price.", request)
            )
        if existing_bid:
            db.delete(existing_bid)
            
        bid = Bid(
            auction_id=bid_in.auction_id,
            user_id=user_id,
            bid_amount=bid_in.bid_amount,
            file=bid_in.file,
            created_at=datetime.now(),
            address=bid_in.address,
            note=bid_in.note
        )
        db.add(bid)
        if auction.currency == "USD":
            message = "You have successfully placed a bid of  {bid_in_bid_amount:,.0f}$ on auction {auction_title}.".format(
                bid_in_bid_amount=bid_in.bid_amount,
                auction_title=auction.title
            )
            message_vi = "Bạn đã đặt giá thầu thành công {bid_in_bid_amount:,.0f}$ của {auction_title}.".format(
                bid_in_bid_amount=bid_in.bid_amount,
                auction_title=auction.title
            )
            message_ko = "{auction_title} 경매에 {bid_in_bid_amount:,.0f}$의 입찰을 성공적으로 완료하였습니다.".format(
                bid_in_bid_amount=bid_in.bid_amount,
                auction_title=auction.title
            )
        elif auction.currency == "VND":
            message = "You have successfully placed a bid of {bid_in_bid_amount:,.0f}₫ on auction {auction_title}.".format(
                bid_in_bid_amount=bid_in.bid_amount,
                auction_title=auction.title
            )
            message_vi = "Bạn đã đặt giá thầu thành công {bid_in_bid_amount:,.0f}₫ của {auction_title}.".format(
                bid_in_bid_amount=bid_in.bid_amount,
                auction_title=auction.title
            )
            message_ko = "{auction_title} 경매에 {bid_in_bid_amount:,.0f}₫의 입찰을 성공적으로 완료하였습니다.".format(
                bid_in_bid_amount=bid_in.bid_amount,
                auction_title=auction.title
            )

        notification = Notification(
            user_id=user_id,
            auction_id = bid_in.auction_id,
            message=message,
            message_vi=message_vi,
            message_ko=message_ko,
            created_at=datetime.now(),
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(bid)
        return bid
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error: " + str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Unexpected error: " + str(e))



@router.get("/bids/user", response_model=List[BidWithAuctionOut])
def get_bids_by_user(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id_from_token)
):
    # Join Bid với Auction để lấy thông tin đầy đủ
    bids_with_auction = db.query(Bid, Auction).join(
        Auction, Bid.auction_id == Auction.id
    ).filter(
        Bid.user_id == user_id
    ).order_by(Bid.created_at.desc()).all()
    
    result = []
    for bid, auction in bids_with_auction:
        bid_with_auction = BidWithAuctionOut(
            id=bid.id,
            auction_id=bid.auction_id,
            user_id=bid.user_id,
            bid_amount=float(bid.bid_amount),
            file=bid.file,
            created_at=bid.created_at,
            address=bid.address,
            note=bid.note,
            is_winner=bid.is_winner,
            auction_title=auction.title,
            auction_description=auction.description,
            currency= auction.currency,
            auction_starting_price=float(auction.starting_price),
            auction_step_price=float(auction.step_price),
            auction_image_url=auction.image_url,
            auction_start_time=auction.start_time,
            auction_end_time=auction.end_time,
            auction_status=auction.status
        )
        result.append(bid_with_auction)
    
    return result

@router.get("/download/excel/{id}")
def download_excel_by_auction(request: Request, id: str, db: Session = Depends(get_db)):
    bid = db.query(Bid).filter(Bid.id == id).first()
    if not bid or not bid.file:
        raise HTTPException(status_code=404, detail=_("Bid or file not found", request))
    filename = os.path.basename(bid.file)
    file_path = os.path.join(BASE_DIR, 'uploads', 'excels', filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail=_("File not found on server", request))
    
    file_size = os.path.getsize(file_path)

    headers = {
        "Content-Length": str(file_size)
    }
    return FileResponse(
        path=file_path,
        filename=filename,
        headers=headers,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )