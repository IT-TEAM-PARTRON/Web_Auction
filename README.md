# WebAuction

Nền tảng đấu giá online cho Partron Vina, gồm `frontend` React/Vite và `backend` FastAPI/MySQL. Hệ thống cho phép admin tạo phiên đấu giá mua hoặc bán, mời participant theo danh sách, upload ảnh/Excel, theo dõi dashboard; phía user có thể đăng ký, đăng nhập, xem phiên, đặt giá kèm file và nhận thông báo theo thời gian.

## Phạm vi chức năng

- Xác thực bằng JWT: `register`, `login`, `refresh-token`, `forgot-password`, `reset-password`.
- Quản lý phiên đấu giá: tạo, sửa, tìm kiếm, lọc, phân trang, xem chi tiết public/admin.
- Quản lý participant: chỉ user được mời mới được đặt giá.
- Quản lý bid: user gửi 1 bid hợp lệ cho mỗi phiên, có thể đính kèm file Excel, admin có thể void bid.
- Thông báo hệ thống: đặt giá thành công, bid bị void, thắng/thua sau khi phiên kết thúc.
- Dashboard admin: thống kê tổng user, auction, auction đang diễn ra, sắp diễn ra, thành công, thất bại.
- Đa ngôn ngữ: `en`, `vi`, `ko` ở cả frontend và backend.
- UI có `Tet Mode`, countdown theo thời gian phiên, search view dạng grid/list.

## Rule nghiệp vụ chính

- `SELL`: bid hợp lệ cao nhất thắng.
- `BUY`: bid hợp lệ thấp nhất thắng.
- Worker nền chạy mỗi `60s` để tự động set winner cho auction đã kết thúc.
- Auction đang diễn ra không cho sửa field nền tảng; chỉ được bổ sung participant mới.
- Auction đã kết thúc không được update.
- Admin/Super Admin không được tham gia bid.

## Tech stack

- Frontend: `React 18`, `Vite`, `TailwindCSS`, `react-router-dom`, `react-hook-form`, `zod`, `axios`, `i18next`, `CKEditor`.
- Backend: `FastAPI`, `SQLAlchemy`, `PyMySQL`, `python-jose`, `python-dotenv`, `Babel`.
- Infra/runtime: `MySQL`, `Nginx`, `Docker Compose`.

## Kiến trúc source

```text
backend/
  app/
    api/v1/          # auth, users, auctions, bids, notifications, categories
    core/            # config, database, auth
    models/          # User, Auction, Bid, Category, Notification, Order, Participant
    services/        # email service
    tasks/           # auto set winner background task
    translations/    # en, vi, ko
  uploads/           # images, excels

frontend/
  src/
    Pages/           # HomePage, OverViewAdmin
    components/      # layout, ui
    contexts/        # auth, tet mode
    services/        # axios client, API helpers
    locales/         # en, vi, ko

docker-compose.yml   # orchestration backend/frontend
```

## API module map

- `auth.py`: login, register, refresh token, quên mật khẩu, reset mật khẩu.
- `users.py`: danh sách user, chi tiết user, update profile, đổi trạng thái, xóa user.
- `categories.py`: CRUD category.
- `auctions.py`: list theo trạng thái, search, create/update auction, upload image/excel, overview, participants, detail.
- `bids.py`: create bid, void bid, lịch sử bid theo user, download file bid.
- `notification.py`: lấy thông báo và đánh dấu đã đọc.

## Cách chạy local

### 1. Yêu cầu

- `Python 3.11+`
- `Node.js 18+`
- `MySQL 8+`

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Biến môi trường tối thiểu trong `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auction
DB_USER=root
DB_PASSWORD=your_password
SECRET_KEY=change_me
ALGORITHM=HS256
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_mail
SENDER_PASSWORD=your_app_password
APP_DOMAIN=http://localhost:3000
BATCH_SIZE=50
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Biến môi trường chính trong `frontend/.env`:

```env
VITE_BASE_URL_LAN=http://127.0.0.1:8000
VITE_BASE_URL_PUBLIC=http://your-domain-or-ip:8000
VITE_PAGE_SIZE=8
VITE_MAX_FILE_SIZE=104857600
```

### 4. Truy cập

- Frontend local: `http://localhost:3000`
- Backend local: `http://localhost:8000`
- Health check: `GET /api/v1/health`

## Deploy/Docker

- `backend/Dockerfile` đã có sẵn.
- `frontend/nginx.conf` đã cấu hình proxy `/api` và `/uploads` về backend.
- `docker-compose.yml` đang khai báo đủ 2 service `backend` và `frontend`.
- Lưu ý: repo hiện **không có** `frontend/Dockerfile`, nên `docker-compose up --build` chưa thể build full stack nếu chưa bổ sung file này.

## Ghi chú kỹ thuật hiện tại

- Repo chưa có migration/seed/init schema; hệ thống đang giả định MySQL schema đã được chuẩn bị sẵn.
- FastAPI mount `uploads` để phục vụ file ảnh và Excel từ `backend/uploads`.
- Frontend gọi API theo same-origin `/api/v1`; khi dev dùng `vite.config.js` để proxy sang `127.0.0.1:8000`.
- Backend có thể serve SPA build từ `app/dist`, nhưng source frontend hiện được tách riêng trong `frontend/`.

## Đánh giá nhanh codebase

- Kiến trúc đủ rõ để phát triển tiếp: tách `api`, `models`, `services`, `tasks`, `contexts`, `components`.
- Domain nghiệp vụ tập trung vào auction enterprise/private, không phải marketplace public.
- Điểm cần ưu tiên nếu đưa production: chuẩn hóa migration, hardening auth/password, tách secret ra khỏi repo, hoàn thiện Docker frontend.
