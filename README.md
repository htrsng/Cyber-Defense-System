<div align="center">

# ◈ CYBERDEF
### AI-Powered Cyber Defense & Threat Monitoring System

![Version](https://img.shields.io/badge/version-1.0.0-00d4ff?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

> Hệ thống giám sát an ninh mạng thời gian thực — phát hiện, phân tích và phản ứng với các cuộc tấn công tự động bằng AI Rule-based Engine.

[Demo](#-demo) • [Tính năng](#-tính-năng) • [Cài đặt](#-cài-đặt-nhanh) • [Kiến trúc](#-kiến-trúc-hệ-thống) • [API](#-api-reference)

</div>

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

**CyberDef** là hệ thống giám sát an ninh mạng được xây dựng cho môn **Bảo mật Ứng dụng và Hệ thống**. Hệ thống mô phỏng môi trường bảo mật thực tế với đầy đủ các lớp tấn công và phòng thủ.

### Vấn đề đặt ra

Các cuộc tấn công mạng ngày càng tinh vi — Brute Force, SQL Injection, XSS, Reconnaissance — xảy ra liên tục mà quản trị viên không thể giám sát thủ công 24/7.

### Giải pháp

CyberDef hoạt động như một **Security Operations Center (SOC)** thu nhỏ:

```
Tấn công đến ──▶ Phát hiện (AI) ──▶ Phân tích (Risk Score) ──▶ Cảnh báo (Real-time) ──▶ Báo cáo (PDF)
```

---

## 🎬 Demo

### Split-screen Demo (Attacker vs Defender)

```
┌─────────────────────────┬─────────────────────────┐
│   DASHBOARD (Chrome)    │   TERMINAL (Attacker)   │
│                         │                         │
│  ⚠ BRUTE FORCE DETECTED │  [ATTACK] Attempt 1/15  │
│  IP: 10.0.0.99          │  password: "123456"      │
│  Risk Score: 60 HIGH    │  → FAILED (401)          │
│                         │                         │
│  ◉ LIVE  admin@cyberdef │  [ATTACK] Attempt 5/15  │
│                         │  → BLOCKED (429)         │
└─────────────────────────┴─────────────────────────┘
```

### Chạy Demo

```bash
# Terminal 1 — Dashboard
open http://localhost:3000

# Terminal 2 — Attacker
cd backend
npm run attack:recon   # Reconnaissance
npm run attack:brute   # Brute Force
npm run attack:sqli    # SQL Injection
npm run attack:xss     # XSS Attack
```

---

## ✨ Tính năng

### 🔐 Authentication & Authorization
| Tính năng | Mô tả |
|-----------|-------|
| JWT Authentication | Access token + auto refresh |
| Two-Factor Auth (2FA) | TOTP với Google Authenticator |
| bcrypt Password Hashing | Salt rounds = 12 |
| Role-based Access | Admin / Viewer |

### 🛡 Defense Layers
| Tính năng | Mô tả |
|-----------|-------|
| Rate Limiting | IP-based throttle với Redis counter |
| IP Blocking | Auto-block khi Risk Score ≥ 60 |
| Honeypot Endpoints | 6 fake endpoints bẫy attacker |
| GeoIP Blocking | Block theo quốc gia (KP, IR, CU, SY) |
| Tarpit Middleware | Delay response 3–30s cho suspicious IP |
| CSP Headers | Content Security Policy chống XSS |
| JWT Blacklist | Token invalidation khi logout |

### ⚡ Attack Simulations
| Tấn công | Mô tả | Phòng thủ |
|----------|-------|-----------|
| Brute Force | 15 password attempts | Rate limiter + IP block |
| SQL Injection | 5 SQLi payloads | ORM parameterized queries |
| Reconnaissance | 8 endpoint probes | Honeypot + instant flag |
| XSS Injection | 5 script payloads | CSP + input sanitization |

### 🤖 AI Risk Scorer
| Rule | Weight | Trigger |
|------|--------|---------|
| Brute Force Moderate | +40 | ≥5 failed logins / 10 min |
| Brute Force Aggressive | +20 | ≥10 failed logins |
| Honeypot Access | +35 | Accessed trap endpoint |
| Rate Limit Abuse | +20 | ≥3 rate limit hits |
| SQL Injection | +50 | SQLi payload detected |
| Suspicious Hour | +10 | Activity 2am–5am |
| Endpoint Scanning | +15 | ≥8 unique endpoints / 5 min |
| Multiple Attack Types | +20 | ≥2 attack types same IP |

### 📊 Dashboard & Reporting
| Tính năng | Mô tả |
|-----------|-------|
| Real-time Dashboard | WebSocket push, không cần F5 |
| Live Activity Log | Stream tất cả events với filter |
| Threat Management | Xem + resolve security events |
| Risk Score Analyzer | Lookup bất kỳ IP, xem lý do |
| Attack Visualizer | Canvas animation real-time |
| XSS Playground | So sánh vulnerable vs protected |
| PDF Security Report | Export báo cáo đầy đủ |
| Email Alerts | Tự động gửi khi có CRITICAL threat |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    LAYER 1: CLIENT                       │
│    React + Custom CSS + Socket.io Client + Recharts     │
│  [Dashboard] [Logs] [Threats] [Risk] [Simulate] [Viz]   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  LAYER 2: API GATEWAY                    │
│                  Express.js + Socket.io                  │
│  [JWT] [Rate Limit] [GeoIP] [Tarpit] [CSP] [Honeypot]  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  LAYER 3: SERVICES                       │
│  [Auth] [LogService] [RiskScorer] [AnomalyDetector]     │
│  [EmailService] [ReportService] [TwoFactor]              │
└────────────┬─────────────────────┬──────────────────────┘
             │                     │
┌────────────▼──────┐   ┌─────────▼──────────────────────┐
│   LAYER 4: DATA   │   │     LAYER 5: SIMULATION         │
│  MongoDB 7.0      │   │  brute-force-attacker.js        │
│  Redis 7.2        │   │  sqli-attacker.js               │
│  (In-memory)      │   │  recon-attacker.js              │
└───────────────────┘   │  xss-attacker.js                │
                        └────────────────────────────────┘
```

### Data Flow khi có tấn công

```
Attacker Request
      │
      ▼
GeoIP Check ──── Blocked Country? ──▶ 403 Forbidden
      │
      ▼
Rate Limiter ─── Too many requests? ─▶ 429 Too Many
      │
      ▼
Honeypot ──────── Trap endpoint? ────▶ 404 (fake) + Log CRITICAL
      │
      ▼
Tarpit ─────────── High risk IP? ────▶ Delay 3-30s
      │
      ▼
Controller Logic
      │
      ├──▶ ActivityLog.create()
      │         │
      │         ▼
      │    AI Risk Scorer ──▶ calculateRiskScore(ip)
      │         │
      │         ▼
      │    Redis counters update
      │
      ├──▶ Socket.io emit('activity_log') ──▶ Dashboard real-time
      │
      ├──▶ AnomalyDetector (nếu high-priority event)
      │         │
      │         ▼
      │    SecurityEvent.create()
      │         │
      │         ▼
      │    EmailService.sendCriticalAlert() (nếu CRITICAL)
      │
      └──▶ Response to attacker
```

---

## 🛠 Tech Stack

| Layer | Technology | Version | Mục đích |
|-------|-----------|---------|----------|
| Frontend | React | 18.3.1 | UI Framework |
| Frontend | Custom CSS + Design Tokens | - | Styling (cyberpunk theme) |
| Frontend | Socket.io Client | 4.7.5 | Real-time updates |
| Frontend | React Router | 6.23.1 | Client-side routing |
| Frontend | Recharts | 2.12.7 | Charts & graphs |
| Frontend | QR Code React | 4.2.0 | QR code generation |
| Frontend | date-fns | 3.6.0 | Date formatting |
| Frontend | Axios | 1.7.2 | HTTP client |
| Backend | Node.js | 20 | Runtime |
| Backend | Express.js | 4.19 | API Framework |
| Backend | Socket.io | 4.7.5 | WebSocket server |
| Backend | Mongoose | 8.4 | MongoDB ODM |
| Backend | ioredis | 5.4.1 | Redis client |
| Backend | jsonwebtoken | 9.0.2 | JWT auth |
| Backend | bcryptjs | 2.4.3 | Password hashing |
| Backend | speakeasy | 2.0.0 | 2FA TOTP |
| Backend | geoip-lite | 1.4.10 | IP geolocation |
| Backend | nodemailer | 8.0.7 | Email alerts |
| Backend | pdfkit | 0.17.2 | PDF generation |
| Backend | uuid | 10.0.0 | Unique ID generation |
| Backend | winston | 3.13.0 | Logging framework |
| Backend | helmet | 7.1.0 | Security headers |
| Backend | cors | 2.8.5 | Cross-origin requests |
| Backend | morgan | 1.10.0 | HTTP request logger |
| Backend | dotenv | 16.4.5 | Environment variables |
| Backend | express-rate-limit | 7.3.1 | Rate limiting |
| Database | MongoDB | 7.0 | Primary database |
| Cache | Redis | 7.2-alpine | Rate limiting, sessions |
| Container | Docker Compose | 2.x | Dev environment |

---

## 🚀 Cài đặt nhanh

### Yêu cầu

- Docker Desktop (Windows/Mac) hoặc Docker Engine (Linux)
- Node.js 20+ (cho attack scripts)
- Git

### 1. Clone repository

```bash
git clone https://github.com/htrsng/Cyber-Defense-System.git
cd cyber-defense
```

### 2. Cấu hình môi trường

```bash
cp backend/.env.example backend/.env
# Chỉnh sửa .env nếu cần (xem phần bên dưới)
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
```
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

```
Email:    tranghuyen20051312@gmail.com
Password: Admin@123
Role:     Admin
```

Hoặc:
```
Email:    viewer@cyberdef.io
Password: Viewer@123
Role:     Viewer
```

---

## ⚙ Cấu hình môi trường

File `backend/.env` (local development):

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB (local)
MONGODB_URI=mongodb://admin:secret123@localhost:27017/cyberdefense?authSource=admin

# Redis (local)
REDIS_URL=redis://:redis123@localhost:6379

# JWT (thay bằng random string dài trong production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# GeoIP Security
BLOCKED_COUNTRIES=KP,IR,CU,SY
BLOCK_TOR=true

# Email Alerts (Gmail App Password)
EMAIL_FROM=your.email@gmail.com
EMAIL_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx
EMAIL_TO=tranghuyen20051312@gmail.com

# Frontend URL (cho CORS và email links)
FRONTEND_URL=localhost:3000
```

**Note:** File `.env.example` có ví dụ với MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=CyberDefense
```

### Tạo Gmail App Password

```
1. Vào https://myaccount.google.com/security
2. Bật 2-Step Verification
3. Tìm "App passwords" → Tạo mới → Mail + Windows
4. Copy 16 ký tự vào EMAIL_APP_PASSWORD (định dạng: xxxx_xxxx_xxxx_xxxx)
```

---

## ⚔ Chạy Attack Simulations

Cài dependencies cho attack scripts:

```bash
cd backend && npm install
```

### Thứ tự demo chuẩn

```bash
# Bước 1: Reconnaissance — do thám hệ thống
npm run attack:recon

# Bước 2: Brute Force — dò mật khẩu
npm run attack:brute

# Bước 3: SQL Injection — bypass authentication
npm run attack:sqli

# Bước 4: XSS Attack — script injection
npm run attack:xss

# Bước 5: Tarpit demo — thấy delay tăng dần
npm run attack:tarpit
```

### Kết quả mong đợi trên Dashboard

| Attack | Alert Type | Risk Score | Level |
|--------|-----------|-----------|-------|
| Recon | HONEYPOT TRIGGERED | 95 | CRITICAL |
| Brute Force | BRUTE FORCE DETECTED | 60–100 | HIGH/CRITICAL |
| SQLi | SQLI DETECTED | 50–80 | HIGH |
| XSS | XSS DETECTED | 85 | CRITICAL |

---

## 📡 API Reference

### Authentication

```bash
# Đăng ký
POST /api/auth/register
Body: { "email": "user@example.com", "password": "Pass@123", "role": "admin" }

# Đăng nhập
POST /api/auth/login
Body: { "email": "tranghuyen20051312@gmail.com", "password": "Admin@123" }
Response: { "token": "eyJ...", "user": {...} }

# Thông tin user hiện tại
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### Authentication (cont.)

```bash
# Logout
POST /api/auth/logout
Headers: Authorization: Bearer <token>
Response: { "message": "Logged out" }
```

### 2FA (Two-Factor Authentication)

```bash
# Setup 2FA — lấy QR code
POST /api/auth/2fa/setup
Headers: Authorization: Bearer <token>
Response: { "qrCodeUrl": "data:image/png...", "secret": "BASE32SECRET" }

# Verify TOTP và bật 2FA (sau khi scan QR)
POST /api/auth/2fa/verify
Headers: Authorization: Bearer <token>
Body: { "token": "123456" }
Response: { "success": true, "message": "2FA enabled" }

# Validate TOTP khi login (nếu 2FA đã bật)
POST /api/auth/2fa/validate
Body: { "token": "123456", "userId": "..." }
Response: { "token": "new_jwt_token", "user": {...} }

# Get 2FA status
GET /api/auth/2fa/status
Headers: Authorization: Bearer <token>
Response: { "enabled": true, "backupCodes": [...] }

# Disable 2FA
POST /api/auth/2fa/disable
Headers: Authorization: Bearer <token>
Body: { "password": "current_password" }
Response: { "message": "2FA disabled" }
```

### Risk Score

```bash
# Score cho 1 IP
GET /api/risk/:ip
Response: { "score": 85, "level": "critical", "reasons": [...], "signals": {...} }

# Score cho nhiều IPs cùng lúc (batch)
POST /api/risk/batch
Body: { "ips": ["10.0.0.1", "10.0.0.2", "10.0.0.3"] }
Response: { "results": [{...}, {...}], "count": 3 }

# Top 10 IPs nguy hiểm nhất (từ logs 1 giờ gần đây)
GET /api/risk/top/ips
Response: { "top": [{ "ip": "10.0.0.99", "score": 100, "level": "critical" }], "total": 25 }

# Thống kê tổng quan (24h, critical events, threats)
GET /api/risk/stats/overview
Response: { "last24h": { "totalEvents": 145, "criticalEvents": 12 }, "unresolvedThreats": 3, "topEventTypes": [...] }

# Trigger manual anomaly detection scan (admin only)
POST /api/risk/analyze
Headers: Authorization: Bearer <token>
Response: { "message": "Anomaly detection completed", "ts": "2024-01-01T12:00:00Z" }
```

### Attack Simulation

```bash
# Brute Force
POST /api/simulate/brute-force
Body: { "attempts": 15, "delayMs": 300 }
Response: { "attempts": 15, "finalRiskScore": 60, "blocked": true }

# SQL Injection
POST /api/simulate/sqli
Response: { "payloadsTested": 5, "riskScore": 80 }

# Honeypot trigger
POST /api/simulate/honeypot
Response: { "endpointsHit": 5, "riskScore": 95 }
```

### XSS Demo

```bash
# Endpoint không được bảo vệ (demo only)
POST /api/xss/vulnerable
Body: { "input": "<script>alert('xss')</script>", "type": "stored" }

# Endpoint được bảo vệ
POST /api/xss/protected
Body: { "input": "<script>alert('xss')</script>" }
Response: { "blocked": true, "sanitized": "&lt;script&gt;..." }

# Auto simulate 5 payloads
POST /api/xss/simulate
```

### Reports

```bash
# Download PDF report
GET /api/reports/security?hours=24
Headers: Authorization: Bearer <token>
Response: PDF file download
```

### GeoIP & Country Blocking

```bash
# Lookup IP location + check if blocked
GET /api/geoip/lookup/8.8.8.8
Headers: Authorization: Bearer <token>
Response: { "ip": "8.8.8.8", "geo": { "country": "US", "city": "Mountain View" }, "blocked": false }

# Get list of currently blocked countries
GET /api/geoip/blocked-countries
Headers: Authorization: Bearer <token>
Response: { "blockedCountries": ["KP", "IR", "CU", "SY"] }

# Block a country
POST /api/geoip/block-country
Headers: Authorization: Bearer <token>
Body: { "countryCode": "RU" }
Response: { "message": "Country added to blocklist", "country": "RU" }

# Unblock a country
POST /api/geoip/unblock-country
Headers: Authorization: Bearer <token>
Body: { "countryCode": "RU" }
Response: { "message": "Country removed from blocklist", "country": "RU" }
```

### Tarpit Management

```bash
# Get tarpit status (which IPs are currently tarpitted)
GET /api/tarpit/status
Headers: Authorization: Bearer <token>
Response: { "tarpitted": [{ "ip": "10.0.0.99", "riskScore": 75, "ttl": 180 }], "count": 1 }

# Manually force an IP into tarpit for 5 minutes
POST /api/tarpit/force/:ip?score=75
Headers: Authorization: Bearer <token>
Body: { "score": 75 }
Response: { "message": "10.0.0.99 tarpitted for 5 minutes" }

# Remove IP from tarpit
DELETE /api/tarpit/clear/:ip
Headers: Authorization: Bearer <token>
Response: { "message": "10.0.0.99 removed from tarpit" }
```

### System Health & Logs

```bash
# Health check endpoint
GET /api/health
Response: { "status": "ok", "ts": "2024-01-01T12:00:00.000Z" }

# Real-time Activity Logs (via WebSocket)
# Note: GET /api/logs is not yet fully implemented
# Use WebSocket connection to listen for real-time activity_log events instead
# Event: activity_log → { ipAddress, eventType, severity, description, timestamp }
```

### Honeypot Endpoints (Security Traps)

Các endpoint sau là honeypot — truy cập bất kỳ endpoint nào sẽ bị flag CRITICAL ngay lập tức:

```
GET/POST /.env
GET/POST /admin/secret
GET/POST /admin/backup
GET/POST /wp-admin
GET/POST /phpmyadmin
GET/POST /admin/config.json
```

Khi attacker truy cập honeypot:
1. Server trả về HTTP 404 giả (attacker không biết đây là bẫy)
2. IP bị gán Risk Score 95/100 ngay lập tức
3. SecurityEvent CRITICAL được tạo
4. Email alert gửi tự động
5. Dashboard hiển thị HONEYPOT TRIGGERED

---

## 🛡 Cơ chế phòng thủ

### Defense in Depth

```
Request đến
    │
    ├─ 1. GeoIP Check       → Block nước nguy hiểm
    ├─ 2. Rate Limiter       → Block IP request quá nhiều
    ├─ 3. Tarpit             → Làm chậm suspicious IP
    ├─ 4. JWT Verification   → Kiểm tra xác thực
    ├─ 5. Honeypot           → Bẫy reconnaissance
    ├─ 6. Input Validation   → Chặn SQLi, XSS
    ├─ 7. CSP Headers        → Ngăn script execution
    └─ 8. AI Risk Scorer     → Phân tích và cảnh báo
```

### Honeypot Strategy

Khi attacker truy cập honeypot:
1. Server trả về `404 Not Found` giả → attacker không biết đây là bẫy
2. IP bị gán Risk Score 95/100 ngay lập tức
3. SecurityEvent CRITICAL được tạo
4. Email alert gửi tự động
5. Dashboard hiển thị alert real-time

### Tarpit Strategy

```
Risk Score 40-60  → Delay 3-12 giây
Risk Score 60-80  → Delay 12-25 giây
Risk Score 80+    → Delay 30 giây → Block 429
Normal users      → Không bị ảnh hưởng
```

---

## 🤖 AI Risk Scorer

### Cách hoạt động

```javascript
// Ví dụ output
{
  "ip": "10.0.0.99",
  "score": 100,
  "level": "critical",
  "reasons": [
    "Multiple failed logins (≥5 in 10 min)",      // +40
    "Aggressive brute force (≥10 failed logins)",  // +20
    "Accessed honeypot endpoint",                  // +35
    "SQL injection payload detected"               // +50
    // Total: 145 → capped at 100
  ],
  "signals": {
    "failedLogins": 15,
    "rateLimitHits": 3,
    "uniqueEndpoints": 8,
    "recentLogCount": 42
  }
}
```

### Tại sao Rule-based thay vì ML?

| Tiêu chí | Rule-based | Machine Learning |
|----------|-----------|-----------------|
| Explainability | ✅ Giải thích được từng lý do | ❌ Black box |
| Training data | ✅ Không cần | ❌ Cần nhiều data |
| Production ready | ✅ Ngay lập tức | ❌ Cần huấn luyện |
| Audit trail | ✅ Dễ kiểm tra | ❌ Khó audit |
| False positives | ✅ Kiểm soát được | ❌ Khó kiểm soát |

---

## 📁 Cấu trúc thư mục

```
cyber-defense/
├── docker-compose.yml
├── package.json
├── README.md
├── docker/
│   └── mongo-init.js              ← Init MongoDB collections + indexes
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js               ← Entry point + Socket.io + schedulers
│       ├── demo-risk-scorer.js    ← Risk scoring demo utility
│       ├── config/
│       │   ├── database.js        ← MongoDB connection
│       │   └── redis.js           ← Redis connection
│       ├── models/
│       │   ├── User.js            ← User schema + bcrypt hooks
│       │   ├── ActivityLog.js     ← All events log
│       │   └── SecurityEvent.js   ← Confirmed threats
│       ├── controllers/
│       │   ├── authController.js  ← Login, register, logout
│       │   ├── twoFactorController.js ← 2FA TOTP
│       │   ├── xssController.js   ← XSS demo endpoints
│       │   └── simulateController.js ← Attack simulations
│       ├── middleware/
│       │   ├── auth.js            ← JWT verification
│       │   ├── honeypot.js        ← Trap endpoints
│       │   ├── geoip.js           ← Country blocking
│       │   └── tarpit.js          ← Response delay
│       ├── services/
│       │   ├── riskScorer.js      ← AI risk scoring engine
│       │   ├── anomalyDetector.js ← Pattern detection
│       │   ├── logService.js      ← Central logging + WebSocket
│       │   ├── emailService.js    ← Email alerts
│       │   └── reportService.js   ← PDF generation
│       ├── routes/
│       │   ├── auth.js
│       │   ├── risk.js
│       │   ├── logs.js
│       │   ├── events.js
│       │   ├── simulate.js
│       │   ├── xss.js
│       │   ├── geoip.js
│       │   ├── tarpit.js
│       │   ├── twoFactor.js
│       │   ├── reports.js
│       │   └── admin.js
│       └── scripts/
│           ├── seed.js            ← Demo data seeder
│           └── attacker/
│               ├── brute-force-attacker.js
│               ├── sqli-attacker.js
│               ├── recon-attacker.js
│               ├── xss-attacker.js
│               └── tarpit-test.js
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── README.md
    ├── build/                     ← Production build output
    │   ├── asset-manifest.json
    │   ├── index.html
    │   └── static/
    │       ├── css/
    │       │   └── main.0d98f757.css
    │       └── js/
    │           ├── main.b307540d.js
    │           └── main.b307540d.js.LICENSE.txt
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx                ← Root + WebSocket state
        ├── index.css              ← Dark cyberpunk design system
        ├── index.js               ← Entry point
        ├── hooks/
        │   ├── useAuth.js         ← Auth context
        │   └── useSocket.js       ← WebSocket hook
        ├── services/
        │   └── api.js             ← Axios + Socket.io instances
        ├── components/
        │   └── layout/
        │       └── Layout.jsx     ← Sidebar + Topbar
        ├── styles/
        │   └── ThreatsPage.css    ← Page-specific styles
        └── pages/
            ├── LoginPage.jsx
            ├── OverviewPage.jsx   ← Dashboard + charts
            ├── LiveLogsPage.jsx   ← Real-time log feed
            ├── ThreatsPage.jsx    ← Security events management
            ├── RiskPage.jsx       ← IP risk analyzer
            ├── SimulatePage.jsx   ← Attack simulation panel
            ├── AttackVisualizerPage.jsx ← Canvas animation
            ├── XSSPage.jsx        ← XSS playground
            ├── TwoFactorPage.jsx  ← 2FA setup UI
            ├── NotificationsPage.jsx ← Email alerts UI
            └── ReportsPage.jsx    ← PDF report generator
```

---

## 🔧 Lệnh hữu ích

```bash
# Xem logs của từng service
docker compose logs -f backend
docker compose logs -f mongodb

# Restart service
docker compose restart backend

# Vào MongoDB shell
docker compose exec mongodb mongosh -u admin -p secret123

# Xem collections
db.getSiblingDB('cyberdefense').activity_logs.find().limit(5).pretty()

# Xóa toàn bộ data và reset
docker compose down -v
docker compose up -d
cd backend && npm run seed

# Backup MongoDB
docker compose exec mongodb mongodump -u admin -p secret123 --out /tmp/backup
docker cp cyberdef_mongo:/tmp/backup ./backup

# Generate JWT secret mạnh
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔒 Bảo mật Production

Trước khi deploy production, đảm bảo:

```bash
# 1. Đổi tất cả passwords mặc định trong .env
JWT_SECRET=<64 random chars>
MONGO_PASSWORD=<strong password>
REDIS_PASSWORD=<strong password>

# 2. Giới hạn CORS
FRONTEND_URL=https://your-domain.com

# 3. Bật HTTPS (nginx + Let's Encrypt)
# 4. Set NODE_ENV=production
# 5. Remove /api/xss/vulnerable endpoint
# 6. Disable MongoDB port exposure (27017)
```

---

## 📄 License

MIT License — xem [LICENSE](LICENSE)

---

## 👨‍💻 Tác giả

Được xây dựng cho môn **Bảo mật Ứng dụng và Hệ thống**

> *"Hệ thống phát hiện, phân tích, cảnh báo và báo cáo toàn bộ tự động — không cần can thiệp thủ công."*

---

<div align="center">

**◈ CYBERDEF** — AI-Powered Cyber Defense System

*Made with ❤️ and lots of ☕*

</div>