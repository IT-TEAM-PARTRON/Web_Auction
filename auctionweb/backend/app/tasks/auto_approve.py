import asyncio
from app.core.database import get_db
from app.models.Auction import Auction
from app.models.Bid import Bid
from datetime import datetime
import logging
from app.models.Notification import Notification
from app.i18n import _
import os
import time
import dotenv
from app.enums import TypeAuction

dotenv.load_dotenv()

BATCH_SIZE = int(os.getenv("BATCH_SIZE", 50))  # Số lượng auction xử lý mỗi lần

logger = logging.getLogger(__name__)

async def auto_set_winner_task():
    """
    Background task: Tự động set is_winner cho bid cao nhất của các auction đã kết thúc mà chưa có winner.
    Chạy mỗi 1 phút.
    """
    while True:
        start_time = time.time()
        try:
            db = next(get_db())
            now = datetime.now()
            # Lấy các auction đã kết thúc mà chưa có bid nào is_winner
            ended_auctions = (
                db.query(Auction)
                .filter(
                    Auction.end_time < now,
                    ~db.query(Bid).filter(Bid.auction_id == Auction.id, Bid.is_winner == True).exists()
                )
                .limit(BATCH_SIZE)
                .all()
            )
            # quét qua từng auction và set người thắng
            for auction in ended_auctions:
                # nếu gói đấu giá là "đăng bán" thì người thắng sẽ là người trả giá cao nhất
                if auction.auction_type == TypeAuction.SELL:
                    highest_bid = (
                        db.query(Bid)
                        .filter(Bid.auction_id == auction.id)
                        .order_by(Bid.bid_amount.desc())
                        .first()
                    )

                    if highest_bid:
                        db.query(Bid).filter(Bid.auction_id == auction.id).update({"is_winner": False}, synchronize_session=False)
                        highest_bid.is_winner = True
                        messages = get_auction_message("win", None, auction.title)
                        notification = Notification(
                            user_id=highest_bid.user_id,
                            auction_id=auction.id,
                            message=messages["en"],
                            message_vi=messages["vi"],
                            message_ko=messages["ko"],
                            created_at=datetime.now(),
                            is_read=False
                        )
                        db.add(notification)
                        losing_bids = db.query(Bid).filter(Bid.auction_id == auction.id, Bid.id != highest_bid.id).all()
                        for losing_bid in losing_bids:
                            messages = get_auction_message("lose", None, auction.title)
                            losing_notification = Notification(
                                user_id=losing_bid.user_id,
                                auction_id=auction.id,
                                message=messages["en"],
                                message_vi=messages["vi"],
                                message_ko=messages["ko"],
                                created_at=datetime.now(),
                                is_read=False
                            )
                            db.add(losing_notification)
                        logger.info(f"Auto-set winner for auction {auction.id}: bid {highest_bid.id} with amount {highest_bid.bid_amount}")
                # nếu gói đấu giá là "đăng mua" thì người thắng sẽ là người trả giá thấp nhất
                else:
                    lowest_bid = (
                        db.query(Bid)
                        .filter(Bid.auction_id == auction.id)
                        .order_by(Bid.bid_amount.asc())
                        .first()
                    )
                    if lowest_bid:
                        db.query(Bid).filter(Bid.auction_id == auction.id).update({"is_winner": False}, synchronize_session=False)
                        lowest_bid.is_winner = True
                        messages = get_auction_message("win", None, auction.title)
                        notification = Notification(
                            user_id=lowest_bid.user_id,
                            auction_id=auction.id,
                            message=messages["en"],
                            message_vi=messages["vi"],
                            message_ko=messages["ko"],
                            created_at=datetime.now(),
                            is_read=False
                        )
                        db.add(notification)
                        losing_bids = db.query(Bid).filter(Bid.auction_id == auction.id, Bid.id != lowest_bid.id).all()
                        for losing_bid in losing_bids:
                            messages = get_auction_message("lose", None, auction.title)
                            losing_notification = Notification(
                                user_id=losing_bid.user_id,
                                auction_id=auction.id,
                                message=messages["en"],
                                message_vi=messages["vi"],
                                message_ko=messages["ko"],
                                created_at=datetime.now(),
                                is_read=False
                            )
                            db.add(losing_notification)
                        logger.info(f"Auto-set winner for auction {auction.id}: bid {lowest_bid.id} with amount {lowest_bid.bid_amount}")

            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"Error in auto_set_winner_task: {str(e)}")
        elapsed = time.time() - start_time
        logger.info(f"Batch processed in {elapsed:.2f} seconds")
        await asyncio.sleep(60)

def start_auto_set_winner_task():
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(auto_set_winner_task())
        logger.info("Auto set winner task started successfully")
    except Exception as e:
        logger.error(f"Error starting auto set winner task: {str(e)}")

def get_auction_message(msg_type, lang, auction_title):
    translations = {
        "win": {
            "en": "Congratulations! You have won the auction {title}.",
            "vi": "Chúc mừng! Bạn đã chiến thắng phiên đấu giá {title}.",
            "ko": "축하합니다! {title} 경매에서 낙찰되었습니다."
        },
        "lose": {
            "en": "Sorry! You did not win the auction {title}.",
            "vi": "Rất tiếc! Bạn đã đấu giá không thành công phiên đấu giá {title}.",
            "ko": "안타깝게도 {title} 경매에서 낙찰되지 못했습니다."
        }
    }
    return {
        "en": translations[msg_type]["en"].format(title=auction_title),
        "vi": translations[msg_type]["vi"].format(title=auction_title),
        "ko": translations[msg_type]["ko"].format(title=auction_title),
    }
