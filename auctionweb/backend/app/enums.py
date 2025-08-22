import enum

class UserRole(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class OrderStatus(enum.Enum):
    pending = "ongoing"
    completed = "completed"

class AuctionStatus(enum.Enum):
    ONGOING = 0      # Đang diễn ra
    UPCOMING = 1     # Sắp diễn ra
    ENDED = 2        # Đã kết thúc, chờ admin phê duyệt
    APPROVED = 3     # Đã được admin phê duyệt người trúng thầu