# ◈ CYBERDEF
### AI-Powered Cyber Defense & Threat Monitoring System

![Version](https://img.shields.io/badge/version-1.0.0-00d4ff?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

> Hệ thống giám sát an ninh mạng thời gian thực - phát hiện, phân tích và phản ứng với các cuộc tấn công tự động bằng AI rule-based engine.

[Demo](#-demo) • [Tính năng](#-tính-năng) • [Cài đặt](#-cài-đặt-nhanh) • [Kiến trúc](#-kiến-trúc-hệ-thống) • [API](#-api-reference)

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Demo](#-demo)
- [Tính năng](#-tính-năng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Tech Stack](#-tech-stack)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Chạy Attack Simulations](#-chạy-attack-simulations)
- [API Reference](#-api-reference)
- [Cơ chế phòng thủ](#-cơ-chế-phòng-thủ)
- [AI Risk Scorer](#-ai-risk-scorer)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tác giả](#-tác-giả)

---

## 🎯 Giới thiệu

**CyberDef** là hệ thống giám sát an ninh mạng được xây dựng cho môi trường demo và thực hành phòng thủ. Ứng dụng mô phỏng đầy đủ các lớp tấn công, ghi log theo thời gian thực, tính điểm rủi ro, tạo báo cáo PDF và cảnh báo khi phát hiện hành vi bất thường.

### Vấn đề đặt ra

Các cuộc tấn công mạng như Brute Force, SQL Injection, XSS và Reconnaissance diễn ra liên tục. Giám sát thủ công không đủ nhanh để phát hiện và phản ứng kịp thời.

### Giải pháp

CyberDef hoạt động như một Security Operations Center (SOC) thu nhỏ:

```text
Tấn công đến -> Phát hiện (AI) -> Phân tích (Risk Score) -> Cảnh báo (Real-time) -> Báo cáo (PDF)
```

---

## 🎬 Demo

### Split-screen demo

```text
┌─────────────────────────┬─────────────────────────┐
│   DASHBOARD (Chrome)    │   TERMINAL (Attacker)   │
│                         │                         │
│  ⚠ BRUTE FORCE DETECTED │  [ATTACK] Attempt 1/15  │
│  IP: 10.0.0.99          │  password: "123456"      │
│  Risk Score: 60 HIGH    │  → FAILED (401)          │
│                         │                         │
│  ◉ LIVE admin@cyberdef  │  [ATTACK] Attempt 5/15   │
│                         │  → BLOCKED (429)         │
└─────────────────────────┴─────────────────────────┘
```

### Chạy demo

```bash
# Terminal 1 - Dashboard
open http://localhost:3000

# Terminal 2 - Attacker
cd backend
npm run attack:recon
npm run attack:brute
npm run attack:sqli
npm run attack:xss
```

---

## ✨ Tính năng

### Authentication & Authorization
| Tính năng | Mô tả |
|-----------|-------|
| JWT Authentication | Access token + protected routes |
| Two-Factor Auth (2FA) | TOTP với Google Authenticator |
| bcrypt Password Hashing | Salt rounds = 12 |
| Role-based Access | Admin / Viewer |

### Defense Layers
| Tính năng | Mô tả |
|-----------|-------|
| Rate Limiting | IP-based throttle với Redis counter |
| IP Blocking | Auto-block khi Risk Score cao |
| Honeypot Endpoints | Fake endpoints bẫy attacker |
| GeoIP Blocking | Block theo quốc gia nguy hiểm |
| Tarpit Middleware | Delay response 3-30s cho IP đáng ngờ |
| CSP Headers | Content Security Policy chống XSS |

### Attack Simulations
| Tấn công | Mô tả | Phòng thủ |
|----------|-------|-----------|
| Brute Force | Nhiều lần login thất bại | Rate limiter + IP block |
| SQL Injection | Payload SQLi phổ biến | Validation + logging |
| Reconnaissance | Do thám endpoint | Honeypot + instant flag |
| XSS Injection | Script payloads | CSP + sanitization |

### Dashboard & Reporting
| Tính năng | Mô tả |
|-----------|-------|
| Real-time Dashboard | WebSocket push, không cần F5 |
| Live Activity Log | Stream events với filter |
| Threat Management | Xem + resolve security events |
| Risk Score Analyzer | Lookup bất kỳ IP, xem lý do |
| Attack Visualizer | Canvas animation real-time |
| XSS Playground | So sánh vulnerable vs protected |
| PDF Security Report | Export báo cáo đầy đủ |
| Email Alerts | Tự động gửi khi có CRITICAL threat |

---

## 🏗 Kiến trúc hệ thống

```text
┌─────────────────────────────────────────────────────────┐
│                    LAYER 1: CLIENT                      │
│        React Dashboard + Socket.io Client               │
│  [Overview] [Logs] [Threats] [Risk] [Simulate] [Viz]    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  LAYER 2: API GATEWAY                   │
│               Express.js + Socket.io                    │
│  [JWT] [Rate Limit] [GeoIP] [Tarpit] [CSP] [Honeypot]  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  LAYER 3: SERVICES                      │
│ [Auth] [LogService] [RiskScorer] [AnomalyDetector]      │
│ [EmailService] [ReportService] [TwoFactor]              │
└────────────┬─────────────────────┬──────────────────────┘
             │                     │
┌────────────▼──────┐   ┌─────────▼──────────────────────┐
│   LAYER 4: DATA   │   │     LAYER 5: SIMULATION        │
│   MongoDB 7.0     │   │  brute-force-attacker.js       │
│   Redis 7.2       │   │  sqli-attacker.js              │
└───────────────────┘   │  recon-attacker.js             │
                        │  xss-attacker.js               │
                        └─────────────────────────────────┘
```

### Data flow khi có tấn công

```text
Attacker Request
      │
      ▼
GeoIP Check ──── Blocked Country? ──▶ 403 Forbidden
      │
      ▼
Rate Limiter ─── Too many requests? ─▶ 429 Too Many
      │
      ▼
Honeypot ──────── Trap endpoint? ────▶ 404 (fake) + CRITICAL log
      │
      ▼
Tarpit ─────────── High risk IP? ────▶ Delay 3-30s
      │
      ▼
Controller Logic
      │
      ├──▶ ActivityLog.create()
      ├──▶ Risk scoring + Redis counters
      ├──▶ Socket.io emit('activity_log')
      ├──▶ SecurityEvent.create() nếu high priority
      └──▶ Response to attacker
```

---

## 🛠 Tech Stack

| Layer | Technology | Version | Mục đích |
|-------|-----------|---------|----------|
| Frontend | React | 18 | UI framework |
| Frontend | Socket.io Client | 4.7 | Real-time updates |
| Frontend | Recharts | 2.12 | Charts & graphs |
| Backend | Node.js | 20 | Runtime |
| Backend | Express.js | 4.19 | API framework |
| Backend | Socket.io | 4.7 | WebSocket server |
| Backend | Mongoose | 8.4 | MongoDB ODM |
| Backend | ioredis | 5.4 | Redis client |
| Backend | jsonwebtoken | 9.0 | JWT auth |
| Backend | bcryptjs | 2.4 | Password hashing |
| Backend | speakeasy | 2.0 | 2FA TOTP |
| Backend | geoip-lite | 1.4 | IP geolocation |
| Backend | nodemailer | 8.0 | Email alerts |
| Backend | pdfkit | 0.17 | PDF generation |
| Database | MongoDB | 7.0 | Primary database |
| Cache | Redis | 7.2 | Rate limiting, sessions |
| Container | Docker Compose | 2.x | Dev environment |

---

## 🚀 Cài đặt nhanh

### Yêu cầu

- Docker Desktop hoặc Docker Engine
- Node.js 20+
- Git

### 1. Clone repository

```bash
git clone https://github.com/htrsng/Cyber-Defense-System.git
cd Cyber-Defense-System
```

### 2. Cấu hình môi trường

```bash
cp backend/.env.example backend/.env
```

### 3. Bật hệ thống

```bash
docker compose up -d
```

### 4. Kiểm tra containers

```bash
docker compose ps
```

Kết quả mong đợi:

```text
NAME                STATUS    PORTS
cyberdef_backend    Up        0.0.0.0:5000->5000/tcp
cyberdef_frontend   Up        0.0.0.0:3000->3000/tcp
cyberdef_mongo      Up        0.0.0.0:27017->27017/tcp
cyberdef_redis      Up        0.0.0.0:6379->6379/tcp
```

### 5. Seed dữ liệu demo

```bash
cd backend
npm install
npm run seed
```

### 6. Truy cập hệ thống

| Service | URL | Thông tin |
|---------|-----|-----------|
| Dashboard | http://localhost:3000 | UI chính |
| Backend API | http://localhost:5000 | REST API |
| Health Check | http://localhost:5000/health | Trạng thái |

### 7. Đăng nhập

```text
Email:    tranghuyen20051312@gmail.com
Password: Admin@123
```

---

## ⚙ Cấu hình môi trường

File `backend/.env`:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://admin:secret123@localhost:27017/cyberdefense?authSource=admin
REDIS_URL=redis://:redis123@localhost:6379

JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

BLOCKED_COUNTRIES=KP,IR,CU,SY
BLOCK_TOR=true

EMAIL_FROM=your.email@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_TO=admin@cyberdef.io

FRONTEND_URL=localhost:3000
```

---

## ⚔ Chạy Attack Simulations

```bash
cd backend && npm install
```

```bash
npm run attack:recon
npm run attack:brute
npm run attack:sqli
npm run attack:xss
npm run attack:tarpit
```

### Kết quả mong đợi trên dashboard

| Attack | Alert Type | Risk Score | Level |
|--------|-----------|-----------|-------|
| Recon | HONEYPOT TRIGGERED | 95 | CRITICAL |
| Brute Force | BRUTE FORCE DETECTED | 60-100 | HIGH/CRITICAL |
| SQLi | SQLI DETECTED | 50-80 | HIGH |
| XSS | XSS DETECTED | 85 | CRITICAL |

---

## 📡 API Reference

### Authentication

```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### 2FA

```bash
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify
POST /api/auth/2fa/validate
POST /api/auth/2fa/disable
```

### Risk Score

```bash
GET /api/risk/:ip
GET /api/risk/top/ips
GET /api/risk/stats/overview
POST /api/risk/analyze
```

### Attack Simulation

```bash
POST /api/simulate/brute-force
POST /api/simulate/sqli
POST /api/simulate/honeypot
```

### XSS Demo

```bash
POST /api/xss/vulnerable
POST /api/xss/protected
POST /api/xss/simulate
```

### Reports

```bash
GET /api/reports/security?hours=24
```

### GeoIP

```bash
GET /api/geoip/lookup/:ip
POST /api/geoip/block-country
```

### Admin

```bash
GET /api/admin/email-config
POST /api/admin/test-email
POST /api/admin/daily-report
```

### Honeypot endpoints

```text
GET/POST /.env
GET/POST /admin/secret
GET/POST /admin/backup
GET/POST /wp-admin
GET/POST /phpmyadmin
GET/POST /admin/config.json
```

---

## 🛡 Cơ chế phòng thủ

### Defense in Depth

```text
Request đến
    │
    ├─ GeoIP Check       -> Block nước nguy hiểm
    ├─ Rate Limiter       -> Block IP request quá nhiều
    ├─ Tarpit             -> Làm chậm suspicious IP
    ├─ JWT Verification   -> Kiểm tra xác thực
    ├─ Honeypot           -> Bẫy reconnaissance
    ├─ Input Validation   -> Chặn SQLi, XSS
    ├─ CSP Headers        -> Ngăn script execution
    └─ AI Risk Scorer     -> Phân tích và cảnh báo
```

### Honeypot strategy

1. Server trả về `404 Not Found` giả.
2. IP bị gán Risk Score 95/100 ngay lập tức.
3. SecurityEvent CRITICAL được tạo.
4. Email alert gửi tự động.
5. Dashboard hiển thị alert real-time.

### Tarpit strategy

```text
Risk Score 40-60  -> Delay 3-12 giây
Risk Score 60-80  -> Delay 12-25 giây
Risk Score 80+    -> Delay 30 giây -> Block 429
Normal users      -> Không bị ảnh hưởng
```

---

## 🤖 AI Risk Scorer

### Cách hoạt động

```javascript
{
  "ip": "10.0.0.99",
  "score": 100,
  "level": "critical",
  "reasons": [
    "Multiple failed logins (≥5 in 10 min)",
    "Aggressive brute force (≥10 failed logins)",
    "Accessed honeypot endpoint",
    "SQL injection payload detected"
  ],
  "signals": {
    "failedLogins": 15,
    "rateLimitHits": 3,
    "uniqueEndpoints": 8,
    "recentLogCount": 42
  }
}
```

### Vì sao rule-based thay vì ML?

| Tiêu chí | Rule-based | Machine Learning |
|----------|-----------|-----------------|
| Explainability | ✅ Giải thích rõ | ❌ Black box |
| Training data | ✅ Không cần | ❌ Cần nhiều data |
| Production ready | ✅ Ngay lập tức | ❌ Cần huấn luyện |
| Audit trail | ✅ Dễ kiểm tra | ❌ Khó audit |
| False positives | ✅ Kiểm soát được | ❌ Khó kiểm soát |

---

## 📁 Cấu trúc thư mục

```text
cyber-defense-step1/
├── README.md
├── docker-compose.yml
├── docker/
│   └── mongo-init.js
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── scripts/
│           └── attacker/
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.jsx
        ├── index.css
        ├── components/
        │   └── layout/
        ├── hooks/
        ├── pages/
        ├── services/
        └── styles/
```

---

## 🔧 Lệnh hữu ích

```bash
# Xem logs của từng service
docker compose logs -f backend
docker compose logs -f frontend

# Restart service
docker compose restart backend

# Vào MongoDB shell
docker compose exec mongodb mongosh -u admin -p secret123

# Xóa toàn bộ data và reset
docker compose down -v
docker compose up -d
cd backend && npm run seed

# Generate JWT secret mạnh
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔒 Bảo mật Production

Trước khi deploy production, đảm bảo:

1. Đổi tất cả mật khẩu mặc định trong `.env`.
2. Giới hạn CORS theo domain thật.
3. Bật HTTPS.
4. Set `NODE_ENV=production`.
5. Ẩn các endpoint demo như `/api/xss/vulnerable`.
6. Không expose MongoDB/Redis ra Internet.

---

## 📄 License

MIT License - xem [LICENSE](LICENSE)

---

## 👨‍💻 Tác giả

Được xây dựng cho môn **Bảo mật Ứng dụng và Hệ thống**.

> *"Hệ thống phát hiện, phân tích, cảnh báo và báo cáo toàn bộ tự động - không cần can thiệp thủ công."*

---

<div align="center">

**◈ CYBERDEF** - AI-Powered Cyber Defense System

*Made with ❤️ and lots of ☕*

</div>
