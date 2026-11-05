import os
import re
import logging
import subprocess
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Base directory của backend
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

# Load biến môi trường từ backend/.env (và cwd nếu có)
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()

# ---------------------------------------------------------
# Database Configuration
# ---------------------------------------------------------
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "123")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "auction")

SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# ---------------------------------------------------------
# Security Configuration
# ---------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "abc")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# ---------------------------------------------------------
# Upload Configuration từ .env (Luôn lấy từ env, không default, không fallback)
# ---------------------------------------------------------
def normalize_upload_root_dir(raw_dir: str) -> str:
    """
    Chuẩn hóa UPLOAD_ROOT_DIR từ .env sang đường dẫn hợp lệ của hệ thống (UNC trên Windows hoặc POSIX path).
    """
    s = str(raw_dir).strip().strip("'\"")

    if os.name == "nt":
        # Bắt đầu bằng IP (e.g. 192.168.23.197/...)
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}[/\\]", s):
            s = "\\\\" + s.replace("/", "\\")
        elif s.startswith("//"):
            s = "\\\\" + s[2:].replace("/", "\\")
        elif s.startswith("\\\\"):
            s = "\\\\" + s[2:].replace("/", "\\")

        if os.path.isabs(s) or s.startswith("\\\\"):
            return os.path.normpath(s)
    else:
        if s.startswith("//") or re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}[/\\]", s):
            s = "/" + s.lstrip("/")
        if os.path.isabs(s):
            return os.path.normpath(s)

    return os.path.abspath(s)


# Luôn lấy giá trị từ biến môi trường, không set giá trị mặc định
UPLOAD_ROOT_DIR_RAW = os.getenv("UPLOAD_ROOT_DIR")
if not UPLOAD_ROOT_DIR_RAW or not UPLOAD_ROOT_DIR_RAW.strip():
    raise RuntimeError("Biến môi trường UPLOAD_ROOT_DIR chưa được cấu hình trong file .env")

# Chuẩn hóa đường dẫn tương thích OS (chuyển sang UNC path trên Windows)
UPLOAD_ROOT_DIR = normalize_upload_root_dir(UPLOAD_ROOT_DIR_RAW)

# Tất cả thư mục upload all in vào UPLOAD_ROOT_DIR
UPLOAD_IMAGE_DIR = os.path.join(UPLOAD_ROOT_DIR, "images")
UPLOAD_EXCEL_DIR = os.path.join(UPLOAD_ROOT_DIR, "excels")


def connect_smb_share_if_needed() -> None:
    """
    Kết nối tới Windows network share (UNC path).
    - Nếu có cấu hình UPLOAD_NET_USER / UPLOAD_NET_PASSWORD thì kết nối theo tài khoản đó.
    - Nếu là IP local không cần tài khoản, tự động thiết lập phiên kết nối ẩn danh (net use <share> "" /user:"")
      để Windows không tự ý gửi account local gây lỗi [WinError 1326].
    """
    if os.name != "nt":
        return

    if not UPLOAD_ROOT_DIR.startswith("\\\\"):
        return

    parts = UPLOAD_ROOT_DIR.lstrip("\\").split("\\")
    if len(parts) < 2:
        return
    share_root = f"\\\\{parts[0]}\\{parts[1]}"

    net_user = os.getenv("UPLOAD_NET_USER")
    net_password = os.getenv("UPLOAD_NET_PASSWORD")

    if net_user and net_password:
        cmd = ["net", "use", share_root, net_password, f"/user:{net_user}"]
    else:
        # IP local không cần tài khoản: kết nối anonymous / guest rỗng để Windows mở session
        cmd = ["net", "use", share_root, "", "/user:"]

    try:
        subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False,
        )
    except Exception as e:
        logger.warning("Không thể thiết lập phiên kết nối share %s: %s", share_root, e)


# Tự động thiết lập session mạng khi config được load
connect_smb_share_if_needed()


def ensure_upload_dirs() -> None:
    """
    Tạo các thư mục lưu trữ images và excels trực tiếp tại UPLOAD_ROOT_DIR.
    Nếu phiên mạng bị gián đoạn, tự động reconnect và thử lại.
    """
    try:
        os.makedirs(UPLOAD_IMAGE_DIR, exist_ok=True)
        os.makedirs(UPLOAD_EXCEL_DIR, exist_ok=True)
    except OSError as e:
        if getattr(e, "winerror", None) == 1326:
            connect_smb_share_if_needed()
            try:
                os.makedirs(UPLOAD_IMAGE_DIR, exist_ok=True)
                os.makedirs(UPLOAD_EXCEL_DIR, exist_ok=True)
                return
            except OSError:
                pass
        logger.warning("Không thể tạo thư mục UPLOAD_ROOT_DIR: %s (%s)", UPLOAD_ROOT_DIR, e)


def find_uploaded_file(subfolder: str, filename: str) -> str | None:
    """
    Tìm file đã upload trực tiếp trong UPLOAD_ROOT_DIR / subfolder / safe_filename.
    Không fallback về thư mục dự án.
    Bảo mật: Sử dụng os.path.basename để ngăn chặn tấn công Path Traversal.
    """
    if not filename:
        return None
    safe_name = os.path.basename(filename).strip()
    if not safe_name:
        return None

    target_path = os.path.abspath(os.path.join(UPLOAD_ROOT_DIR, subfolder, safe_name))
    expected_dir = os.path.abspath(os.path.join(UPLOAD_ROOT_DIR, subfolder))

    try:
        if os.path.commonpath([target_path, expected_dir]) == expected_dir:
            if os.path.isfile(target_path):
                return target_path
    except OSError as e:
        if getattr(e, "winerror", None) == 1326:
            connect_smb_share_if_needed()
            try:
                if os.path.isfile(target_path):
                    return target_path
            except OSError:
                pass

    return None
