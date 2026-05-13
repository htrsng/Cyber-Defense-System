# AI-Powered Cyber Defense & Threat Monitoring System

## Stack
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB 7.0
- **Cache**: Redis 7.2
- **Container**: Docker Compose

## Khởi động nhanh

```bash
# 1. Copy env
cp backend/.env.example backend/.env

# 2. Bật toàn bộ hệ thống (MongoDB + Redis + Backend)
docker compose up -d

# 3. Xem logs backend
docker compose logs -f backend

# 4. Tắt
docker compose down

# Xóa cả data volumes (reset DB)
docker compose down -v
```

## Cấu trúc thư mục
```
cyber-defense/
├── docker-compose.yml
├── docker/
│   └── mongo-init.js       ← Tạo collections + indexes khi khởi động
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js         ← Entry point, Socket.io
│       ├── config/
│       │   ├── database.js  ← MongoDB connection
│       │   └── redis.js     ← Redis connection
│       ├── models/
│       │   ├── User.js
│       │   ├── ActivityLog.js
│       │   └── SecurityEvent.js
│       ├── middleware/
│       │   └── honeypot.js  ← Bẫy attacker
│       └── routes/
│           ├── auth.js
│           ├── logs.js
│           ├── events.js
│           └── simulate.js
└── frontend/               ← React app (bước tiếp theo)
