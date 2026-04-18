import enum

class UserRole(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

# chưa dùng đến
class OrderStatus(enum.Enum):
    pending = "ongoing"
    completed = "completed"

class TypeAuction(enum.Enum):
    SELL = "SELL" # phía admin là người bán
    BUY = "BUY" # phía admin là người mua
# chưa dùng đến
class AuctionStatus(enum.Enum):
    ONGOING = 0      # Đang diễn ra
    UPCOMING = 1     # Sắp diễn ra
    ENDED = 2        # Đã kết thúc, chờ admin phê duyệt
    APPROVED = 3     # Đã được admin phê duyệt người trúng thầu

class BidStatus(enum.Enum):
    VALID = "VALID"      # Hợp lệ
    INVALID = "INVALID"    # Không hợp lệ