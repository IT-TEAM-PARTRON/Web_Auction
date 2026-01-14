#install
- Cài các thư viện BE fastapi: pip install -r requirements.txt
- Cài thư viện FE reactjs: npm i
# Config file .env BE:
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
DB_NAME=auction
DB_PORT=3306

# Security
SECRET_KEY=abc
ALGORITHM=HS256

# Auto chose winner
BATCH_SIZE = 50

# Application Settings
DEBUG=True
ENVIRONMENT=production

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=cuong3172002acc1@gmail.com
SENDER_PASSWORD=somg vjtx mtij fbxi
APP_DOMAIN=http://localhost:3000

# CORS Settings
ALLOWED_ORIGINS=["http://your-domain.com", "http://localhost:8080"]

#Config file .env BE:
VITE_BASE_URL_LAN=http://192.168.211.217:8000
VITE_BASE_URL_PUBLIC=http://14.252.196.12:8000
VITE_PAGE_SIZE=8
VITE_MAX_FILE_SIZE=104857600  # 100MB = 100 * 1024 * 1024
