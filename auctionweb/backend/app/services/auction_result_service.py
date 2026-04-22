from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.enums import BidStatus, TypeAuction
from app.models.Auction import Auction
from app.models.Bid import Bid


def _auction_type_value(auction_or_type) -> str:
    auction_type = getattr(auction_or_type, "auction_type", auction_or_type)
    if isinstance(auction_type, TypeAuction):
        return auction_type.value
    return str(auction_type)


def get_auction_status(auction: Auction, now: Optional[datetime] = None) -> int:
    current_time = now or datetime.now()
    if current_time < auction.start_time:
        return 1
    if current_time < auction.end_time:
        return 0
    return 2


def get_bid_ranking_order(auction_or_type):
    if _auction_type_value(auction_or_type) == TypeAuction.BUY.value:
        return (Bid.bid_amount.asc(), Bid.created_at.asc(), Bid.id.asc())
    return (Bid.bid_amount.desc(), Bid.created_at.asc(), Bid.id.asc())


def get_best_valid_bid(db: Session, auction: Auction) -> Optional[Bid]:
    return (
        db.query(Bid)
        .filter(
            Bid.auction_id == auction.id,
            Bid.status == BidStatus.VALID.value,
        )
        .order_by(*get_bid_ranking_order(auction))
        .first()
    )


def get_valid_winner_bid(db: Session, auction_id: str) -> Optional[Bid]:
    return (
        db.query(Bid)
        .filter(
            Bid.auction_id == auction_id,
            Bid.is_winner.is_(True),
            Bid.status == BidStatus.VALID.value,
        )
        .order_by(Bid.created_at.asc(), Bid.id.asc())
        .first()
    )


def sync_winner_for_auction(db: Session, auction: Auction) -> Optional[Bid]:
    best_valid_bid = get_best_valid_bid(db, auction)
    (
        db.query(Bid)
        .filter(Bid.auction_id == auction.id, Bid.is_winner.is_(True))
        .update({"is_winner": False}, synchronize_session=False)
    )
    if best_valid_bid:
        best_valid_bid.is_winner = True
    return best_valid_bid


def get_auction_result_bid(db: Session, auction: Auction) -> Tuple[Optional[Bid], Optional[Bid]]:
    best_valid_bid = get_best_valid_bid(db, auction)
    winner_bid = get_valid_winner_bid(db, auction.id)
    if winner_bid and best_valid_bid and winner_bid.id == best_valid_bid.id:
        return winner_bid, winner_bid
    return None, best_valid_bid
