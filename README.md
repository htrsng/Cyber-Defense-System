# 🛡️ Hệ Thống Bảo Vệ Mạng Dùng AI & Giám Sát Mối Đe Dọa

> **Nền tảng Giám Sát An Ninh Mạng Cấp Enterprise** với Phát Hiện Mối Đe Dọa Thời Gian Thực, AI Risk Scoring Engine, và Attack Simulation Framework

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18%2B-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Latest-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng Chính](#tính-năng-chính)
- [Stack Công Nghệ](#stack-công-nghệ)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Khởi Động Nhanh](#khởi-động-nhanh)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Thành Phần Chính](#thành-phần-chính)
- [Tài Liệu API](#tài-liệu-api)
- [Tính Năng Bảo Mật](#tính-năng-bảo-mật)
- [Schema Cơ Sở Dữ Liệu](#schema-cơ-sở-dữ-liệu)
- [Cấu Hình](#cấu-hình)
- [Phát Triển](#phát-triển)
- [Đóng Góp](#đóng-góp)

---

## 🎯 Tổng Quan

**Cyber Defense System** là nền tảng giám sát an ninh mạng toàn diện được thiết kế để phát hiện, phân tích và ứng phó các mối đe dọa mạng trong thời gian thực. Nó kết hợp cơ chế tính điểm rủi ro dựa trên Machine Learning với Anomaly Detection để cung cấp các khả năng Threat Intelligence cấp Enterprise và xử lý sự cố.

### Khả Năng Cốt Lõi
- 🔍 **Phát Hiện Mối Đe Dọa Thời Gian Thực**: Xác định Brute Force, SQL Injection, và Reconnaissance attempts
- 📊 **AI Risk Scoring**: Tính toán mức đe dọa (0-100) dựa trên phân tích đa yếu tố
- 🚨 **Anomaly Detection Tự Động**: Hệ thống tự học phát hiện những sai lệch hành vi
- 🎮 **Attack Simulation Framework**: Kiểm tra khả năng chống chịu với các cuộc tấn công mô phỏng
- 🪤 **Honeypot Deployment**: Triển khai cơ sở hạ tầng lừa dối để phát hiện Reconnaissance
- 📡 **Dashboard Real-Time**: Giám sát và cảnh báo trực tiếp dùng WebSocket
- 🔐 **Role-Based Access Control**: Phân quyền Admin và Viewer với kiểm soát chi tiết

---

## ✨ Tính Năng Chính

### 1. **Threat Detection Engine (Động Cơ Phát Hiện Mối Đe Dọa)**
| Loại Mối Đe Dọa | Phương Pháp Phát Hiện | Trọng Số Rủi Ro | Ngưỡng Auto-Block |
|------------------|---------------------|-----------------|-------------------|
| Brute Force Attack | Phân tích mẫu đăng nhập thất bại (≥5 trong 10 phút) | 40-60 pts | Risk ≥ 80 |
| SQL Injection (SQLi) | Phát hiện chữ ký Payload | 50 pts | Risk ≥ 80 |
| Reconnaissance (Recon) | Truy cập Honeypot endpoint | 35 pts | Risk ≥ 80 |
| Rate Limit Abuse | Kích hoạt Rate Limiter lặp lại (≥3) | 20 pts | Risk ≥ 80 |

### 2. **Intelligent Risk Scoring (Tính Điểm Rủi Ro Thông Minh)**
- **Phân Tích Đa Yếu Tố**: Kết hợp các vector tấn công với các mẫu lịch sử
- **Dynamic Weighting**: Công cụ dựa trên Rules với các ngưỡng có thể cấu hình
- **Auto-Blocking**: Chặn IP tự động khi risk score ≥80
- **Evidence Tracking**: Dấu vết kiểm toán chi tiết tất cả các yếu tố tính toán

### 3. **Anomaly Detection (Phát Hiện Bất Thường)**
- **Scheduled Analysis**: Chạy tự động mỗi 2 phút
- **Pattern Recognition**: Phát hiện sai lệch từ hành vi cơ sở
- **Incident Creation**: Tự động tạo Security Events cho bất thường
- **Độ Nghiêm Trọng**: Low/Medium/High/Critical Severity Levels

### 4. **Security Monitoring (Giám Sát Bảo Mật)**
- **Activity Logging**: Dấu vết kiểm toán toàn diện tất cả các sự kiện hệ thống
- **Event Correlation**: Liên kết các sự kiện bảo mật liên quan để điều tra
- **Incident Management**: Theo dõi, giải quyết và đóng các sự kiện bảo mật
- **Metrics & Analytics**: Dữ liệu lịch sử để phân tích xu hướng

---

## 🏗️ Stack Công Nghệ

| Lớp | Công Nghệ | Phiên Bản | Mục Đích |
|-----|-----------|----------|---------|
| **Frontend** | React.js + Hooks | 18.0+ | UI & Dashboard Tương Tác |
| | Tailwind CSS | Latest | Styling Responsive |
| | Socket.io Client | 4.7+ | Cập Nhật Real-Time |
| **Backend** | Node.js | 18.0+ | Môi Trường Runtime |
| | Express.js | 4.19+ | Web Framework |
| | Socket.io | 4.7+ | Giao Tiếp WebSocket |
| **Database** | MongoDB | 7.0 | Kho Dữ Liệu Chính |
| | Redis | 7.2 | Caching & Sessions |
| **Security** | JWT | - | Token-based Authentication |
| | Bcryptjs | 2.4+ | Password Hashing |
| | Helmet.js | 7.1+ | HTTP Headers Security |
| **Containerization** | Docker | Latest | Container Runtime |
| | Docker Compose | Latest | Orchestration |

---

## 🎨 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                       LỚPMẶT TRƯỚC (FRONTEND)               │
│  React Dashboard (React Router, WebSocket Client)            │
│  ├── Trang Tổng Quan   ├── Nhật Ký Trực Tiếp ├── Risk View  │
│  ├── Threat Intelligence ├── Attack Simulator ├── Visualizer │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP + WebSocket
┌──────────────────▼──────────────────────────────────────────┐
│                    API GATEWAY / MIDDLEWARE                  │
│  • CORS & Security Headers  • Rate Limiting (100 req/min)    │
│  • JWT Authentication       • IP Validation                  │
│  • Request Logging          • Error Handling                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                  LỚPLOGIC KINH DOANH (BUSINESS LOGIC)       │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ Auth Service   │  │ Risk Scoring     │  │ Anomaly     │ │
│  │                │  │ Engine (Rules)   │  │ Detector    │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
│  ┌────────────────┐  ┌──────────────────┐                   │
│  │ Event Service  │  │ Log Service      │                   │
│  └────────────────┘  └──────────────────┘                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    LỚPTRUY CẬP DỮ LIỆU (DATA ACCESS)        │
│  MongoDB Queries (Mongoose ODM) & Redis Caching              │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│             LỚPLƯU TRỮ DỮ LIỆU BỀN VỮng (PERSISTENT STORAGE)│
│  MongoDB (Users, Activities, Events)                         │
│  Redis (Cache, Session Store, Rate Limit Counters)          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Khởi Động Nhanh

### Yêu Cầu Trước
- Docker & Docker Compose v2.0+
- Node.js v18+ (cho phát triển cục bộ)
- npm v9+ hoặc yarn v3+

### Cài Đặt

#### Tùy Chọn 1: Docker Compose (Được Khuyến Nghị)

```bash
# Clone repository
git clone https://github.com/htrsng/Cyber-Defense-System.git
cd Cyber-Defense-System

# Sao chép cấu hình môi trường
cp backend/.env.example backend/.env

# Khởi động tất cả các dịch vụ (MongoDB, Redis, Backend, Frontend)
docker compose up -d

# Giám sát logs
docker compose logs -f backend
docker compose logs -f frontend

# Truy cập ứng dụng
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

#### Tùy Chọn 2: Phát Triển Cục Bộ

```bash
# Cài đặt backend dependencies
cd backend
npm install
NODE_ENV=development npm run dev

# Trong terminal khác, cài đặt frontend dependencies
cd frontend
npm install
npm start
```

### Dọn Dẹp

```bash
# Dừng tất cả các dịch vụ
docker compose down

# Xóa tất cả dữ liệu (reset database)
docker compose down -v
```

---

## 📁 Cấu Trúc Dự Án

```
cyber-defense-step1/
├── README.md                          # Tệp này
├── docker-compose.yml                 # Container orchestration
├── docker/
│   └── mongo-init.js                  # MongoDB initialization script
│
├── backend/                           # Node.js/Express API
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js                   # Express app & Socket.io server
│       ├── demo-risk-scorer.js        # Standalone risk calculator
│       ├── config/
│       │   ├── database.js            # MongoDB connection config
│       │   └── redis.js               # Redis client config
│       ├── models/                    # Mongoose schemas
│       │   ├── User.js                # User authentication model
│       │   ├── ActivityLog.js         # Activity audit log model
│       │   └── SecurityEvent.js       # Security incident model
│       ├── controllers/               # Route handlers
│       │   ├── authController.js      # Auth operations
│       │   └── simulateController.js  # Attack simulation
│       ├── services/                  # Business logic
│       │   ├── riskScorer.js          # Risk calculation engine
│       │   ├── anomalyDetector.js     # Pattern detection
│       │   └── logService.js          # Logging utilities
│       ├── middleware/
│       │   ├── auth.js                # JWT authentication
│       │   └── honeypot.js            # Honeypot trap handler
│       ├── routes/                    # API endpoints
│       │   ├── auth.js                # /api/auth
│       │   ├── events.js              # /api/events
│       │   ├── logs.js                # /api/logs
│       │   ├── risk.js                # /api/risk
│       │   └── simulate.js            # /api/simulate
│       └── scripts/                   # Utility scripts
│           ├── seed.js                # Database seeding
│           └── attacker/              # Attack simulation scripts
│               ├── brute-force-attacker.js
│               ├── sqli-attacker.js
│               └── recon-attacker.js
│
└── frontend/                          # React application
    ├── Dockerfile
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js                   # React entry point
        ├── App.jsx                    # Root component
        ├── index.css                  # Global styles
        ├── components/
        │   └── layout/
        │       └── Layout.jsx         # Main layout wrapper
        ├── hooks/
        │   ├── useAuth.js             # Authentication context
        │   └── useSocket.js           # WebSocket connection hook
        ├── pages/                     # Page components
        │   ├── OverviewPage.jsx       # Dashboard overview
        │   ├── LiveLogsPage.jsx       # Activity log viewer
        │   ├── RiskPage.jsx           # Risk assessment view
        │   ├── SimulatePage.jsx       # Attack simulator UI
        │   ├── ThreatsPage.jsx        # Threat intelligence
        │   └── AttackVisualizerPage.jsx # Network visualization
        ├── services/
        │   └── api.js                 # API client
        └── styles/
            └── ThreatsPage.css        # Component styles
```

---

## 🔧 Thành Phần Chính

### **1. Risk Scoring Engine (Động Cơ Tính Điểm Rủi Ro)** - `services/riskScorer.js`

Đánh giá rủi ro đa yếu tố dựa trên các quy tắc có thể cấu hình:

```javascript
// Quy Tắc Tính Điểm Rủi Ro
const RULES = [
  { id: 'BRUTE_FORCE_MODERATE',    weight: 40,  triggers: ≥5 đăng nhập thất bại (10 phút) },
  { id: 'BRUTE_FORCE_AGGRESSIVE',  weight: 20,  triggers: ≥10 đăng nhập thất bại },
  { id: 'HONEYPOT_ACCESS',         weight: 35,  triggers: Honeypot endpoint được truy cập },
  { id: 'RATE_LIMIT_ABUSE',        weight: 20,  triggers: ≥3 rate limit hits },
  { id: 'SQLI_ATTEMPT',            weight: 50,  triggers: SQL injection payload phát hiện },
  { id: 'MULTI_VECTOR_ATTACK',     weight: 20,  triggers: ≥2 loại tấn công từ cùng IP }
];

// Mức Rủi Ro
0-30:   LOW       (thông tin)
31-60:  MEDIUM    (cảnh báo)
61-79:  HIGH      (yêu cầu điều tra)
80-100: CRITICAL  (tự động chặn)
```

### **2. Anomaly Detection Service (Dịch Vụ Phát Hiện Bất Thường)** - `services/anomalyDetector.js`

Giám sát liên tục với các ngưỡng có thể cấu hình:

```javascript
DETECTION_PATTERNS = {
  BruteForce:     { window: 10 phút,  threshold: ≥5 LOGIN_FAILED events },
  Scanning:       { window: 5 phút,   threshold: ≥8 endpoint khác nhau },
  RateLimitAbuse: { window: 5 phút,   threshold: ≥3 rate limit hits },
};

// Thực Hiện
- Chạy mỗi 2 phút (có thể cấu hình)
- Tạo Security Event objects cho các bất thường phát hiện
- Kích hoạt cảnh báo Socket.io thời gian thực
- Tự động chặn IP với score ≥80
```

### **3. Authentication System (Hệ Thống Xác Thực)** - `controllers/authController.js`

```javascript
// User Model
{
  email:      string (unique, lowercase)
  password:   bcrypt hashed (12 rounds)
  role:       'admin' | 'viewer'
  lastLogin:  Date
  loginCount: number
  isBlocked:  boolean
}

// JWT Token Structure
{
  userId: ObjectId,
  role:   'admin' | 'viewer',
  iat:    issued timestamp,
  exp:    expiration (mặc định: 7 ngày)
}
```

### **4. Honeypot Middleware (Middleware Bẫy)** - `middleware/honeypot.js`

Phát hiện xâm nhập dựa trên lừa dối:

```javascript
// Honeypot Endpoints (trap URLs)
/admin/secret
/admin/backup
/.env
/wp-admin
/phpmyadmin
/admin/config.json

// Sự Kiện Được Kích Hoạt
eventType: 'HONEYPOT_TRIGGERED'
severity: 'high'
riskScore: +35 points
metadata: { endpoint, userAgent, headers }
```

---

## 📡 Tài Liệu API

### Base URL
```
http://localhost:5000/api
```

### **Các Endpoint Xác Thực**

#### Đăng Ký Người Dùng
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "viewer"  // hoặc "admin"
}

Response (201):
{
  "message": "Người dùng được tạo",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "viewer",
    "createdAt": "2024-05-15T10:30:00Z"
  }
}
```

#### Đăng Nhập
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { /* user object */ }
}
```

---

### **Các Endpoint Nhật Ký**

#### Lấy Activity Logs
```http
GET /logs?limit=50&offset=0&severity=high
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "logs": [
    {
      "id": "507f1f77bcf86cd799439011",
      "eventType": "LOGIN_FAILED",
      "ipAddress": "192.168.1.100",
      "severity": "medium",
      "timestamp": "2024-05-15T10:30:00Z",
      "metadata": { "reason": "Mật khẩu không hợp lệ" }
    }
  ],
  "total": 1523,
  "limit": 50,
  "offset": 0
}
```

---

### **Các Endpoint Sự Kiện Bảo Mật**

#### Lấy Security Events
```http
GET /events?type=BRUTE_FORCE&resolved=false
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "events": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "BRUTE_FORCE",
      "ipAddress": "10.0.0.99",
      "description": "Brute force phát hiện: 12 failed login attempts trong 10 phút",
      "severity": "critical",
      "riskScore": 85,
      "evidence": {
        "failedAttempts": 12,
        "windowMinutes": 10,
        "reasons": ["BRUTE_FORCE_AGGRESSIVE"]
      },
      "resolved": false,
      "createdAt": "2024-05-15T10:30:00Z"
    }
  ]
}
```

#### Giải Quyết Security Event (Chỉ Admin)
```http
POST /events/{eventId}/resolve
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "notes": "Người dùng hợp pháp được xác nhận"
}

Response (200):
{
  "message": "Sự kiện đã được giải quyết",
  "event": { /* updated event */ }
}
```

---

### **Các Endpoint Đánh Giá Rủi Ro**

#### Tính Toán Risk Score
```http
POST /risk/calculate
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "ipAddress": "10.0.0.99"
}

Response (200):
{
  "ipAddress": "10.0.0.99",
  "score": 75,
  "level": "HIGH",
  "reasons": [
    "BRUTE_FORCE_AGGRESSIVE",
    "HONEYPOT_ACCESS"
  ],
  "signals": [
    { rule: "BRUTE_FORCE_AGGRESSIVE", weight: 20, matched: true },
    { rule: "HONEYPOT_ACCESS", weight: 35, matched: true }
  ]
}
```

---

### **Các Endpoint Mô Phỏng Tấn Công**

#### Mô Phỏng Brute Force
```http
POST /simulate/brute-force
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "iterations": 15
}

Response (200):
{
  "message": "Brute force attack mô phỏng với 15 attempts",
  "attempts": 15,
  "finalRiskScore": 68,
  "level": "HIGH",
  "blocked": false,
  "results": [
    { "attempt": 1, "payload": "fakepass1", "status": 401 },
    { "attempt": 2, "payload": "fakepass2", "status": 401 }
  ]
}
```

#### Mô Phỏng SQL Injection
```http
POST /simulate/sqli
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "customPayloads": ["' OR 1=1 --", "admin'--"]  // tùy chọn
}

Response (200):
{
  "message": "SQL injection attack mô phỏng",
  "payloads_tested": 5,
  "successful_bypasses": 0,
  "finalRiskScore": 72,
  "level": "HIGH"
}
```

#### Mô Phỏng Reconnaissance (Honeypot)
```http
POST /simulate/recon
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "message": "Reconnaissance attack mô phỏng",
  "honeypot_endpoints_accessed": 6,
  "finalRiskScore": 78,
  "level": "HIGH"
}
```

---

## 🔒 Tính Năng Bảo Mật

### **Xác Thực & Phân Quyền**
- ✅ JWT token-based authentication (hết hạn 7 ngày)
- ✅ Role-based access control (RBAC): Admin vs Viewer
- ✅ Password hashing với bcryptjs (12-round salting)
- ✅ Token validation trên mỗi protected endpoint

### **Bảo Mật Mạng**
- ✅ CORS protection (whitelist: localhost:3000, localhost:3001)
- ✅ Helmet.js cho HTTP security headers
- ✅ Rate limiting (100 requests/phút mỗi IP)
- ✅ Theo dõi địa chỉ IP và logging

### **Bảo Vệ Dữ Liệu**
- ✅ MongoDB connection với xác thực
- ✅ Redis được bảo mật bằng xác thực mật khẩu
- ✅ Password không bao giờ được trả về trong API responses
- ✅ Metadata nhạy cảm được mã hóa trong logs

### **Phát Hiện Mối Đe Dọa**
- ✅ Phát hiện Brute Force với auto-blocking
- ✅ Lọc payload SQL injection
- ✅ Phát hiện Reconnaissance dựa trên Honeypot
- ✅ Phát hiện Rate Limit abuse
- ✅ Tương quan tấn công đa vector

### **Kiểm Toán & Tuân Thủ**
- ✅ Comprehensive activity logging (tất cả các sự kiện)
- ✅ Security event tracking với evidence
- ✅ Incident resolution workflows
- ✅ Audit trail cho báo cáo tuân thủ

---

## 💾 Schema Cơ Sở Dữ Liệu

### **Users Collection**
```javascript
{
  _id:        ObjectId,
  email:      String (unique, indexed),
  password:   String (bcrypt hashed),
  role:       Enum ['admin', 'viewer'],
  lastLogin:  Date,
  loginCount: Number,
  isBlocked:  Boolean,
  createdAt:  Date (indexed),
  updatedAt:  Date
}
```

### **ActivityLogs Collection**
```javascript
{
  _id:          ObjectId,
  eventType:    Enum [LOGIN_SUCCESS, LOGIN_FAILED, HONEYPOT_TRIGGERED, ...],
  userId:       ObjectId (ref: User),
  ipAddress:    String (indexed),
  userAgent:    String,
  endpoint:     String,
  method:       String (GET, POST, etc.),
  metadata:     Mixed (flexible payload),
  riskScore:    Number (0-100),
  riskReasons:  [String],
  severity:     Enum [info, low, medium, high, critical],
  createdAt:    Date (indexed),
  updatedAt:    Date
}
```

### **SecurityEvents Collection**
```javascript
{
  _id:        ObjectId,
  type:       Enum [BRUTE_FORCE, SQL_INJECTION, HONEYPOT_ACCESS, ...],
  ipAddress:  String (indexed),
  description: String,
  severity:   Enum [low, medium, high, critical],
  riskScore:  Number (0-100),
  evidence:   Mixed (attack details),
  resolved:   Boolean,
  resolvedAt: Date,
  resolvedBy: ObjectId (ref: User),
  createdAt:  Date (indexed),
  updatedAt:  Date
}
```

### **Redis Key Patterns**
```javascript
failed_login:{ipAddress}        // Counter (TTL: 10 phút)
blocked_ip:{ipAddress}          // Flag (TTL: 5 phút)
rate_limit:{ipAddress}          // Counter (TTL: 1 phút)
session:{sessionId}             // Session data (TTL: 7 ngày)
```

---

## ⚙️ Cấu Hình

### **Biến Môi Trường** (`.env`)

```bash
# Ứng Dụng
NODE_ENV=development
PORT=5000

# Cơ Sở Dữ Liệu
MONGODB_URI=mongodb://admin:secret123@mongodb:27017/cyberdefense?authSource=admin
REDIS_URL=redis://:redis123@redis:6379

# Xác Thực
JWT_SECRET=super_secret_jwt_key_change_in_prod
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000        # 1 phút
RATE_LIMIT_MAX=100                # requests mỗi window

# Bảo Mật
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Anomaly Detection
ANOMALY_CHECK_INTERVAL=120000     # 2 phút
AUTO_BLOCK_SCORE=80
BLOCK_DURATION=300000             # 5 phút
```

---

## 🛠️ Phát Triển

### **Phát Triển Backend**

```bash
cd backend
npm install

# Development server với hot reload
npm run dev

# Database seeding với dữ liệu test
npm run seed

# Chạy attack simulations
npm run attack:brute
npm run attack:sqli
npm run attack:recon
```

### **Phát Triển Frontend**

```bash
cd frontend
npm install

# Development server
npm start

# Build cho production
npm run build
```

### **Phát Triển Docker**

```bash
# Rebuild containers sau thay đổi mã
docker compose up --build

# Xem logs
docker compose logs -f backend
docker compose logs -f frontend

# Truy cập container shell
docker exec -it cyberdef_backend sh
docker exec -it cyberdef_mongo mongosh -u admin -p secret123

# Giám sát hiệu suất
docker stats
```

---

## 📊 Chỉ Số Hiệu Suất

| Chỉ Số | Mục Tiêu | Ghi Chú |
|--------|----------|--------|
| API Response Time | <200ms | Tại 50 concurrent users |
| Risk Score Calculation | <100ms | Mỗi IP address |
| Anomaly Detection | <5s | Cho 10k+ logs mỗi lần chạy |
| WebSocket Latency | <50ms | Dashboard cập nhật real-time |
| Database Query | <100ms | MongoDB indexes được tối ưu |

---

## 🤝 Đóng Góp

Chúng tôi hoan nghênh các đóng góp cải thiện Cyber Defense System. Vui lòng tuân theo các hướng dẫn này:

### **Quy Trình Phát Triển**

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### **Tiêu Chuẩn Code**

- Sử dụng async/await cho các hoạt động bất đồng bộ
- Tuân theo cấu hình ESLint cho style code
- Viết commit messages có ý nghĩa
- Thêm comments cho logic phức tạp
- Test tất cả API endpoints trước submit

### **Báo Cáo Lỗi**

Vui lòng bao gồm:
- Mô tả lỗi
- Các bước để reproduce
- Hành vi mong đợi vs thực tế
- Chi tiết môi trường (OS, Node version, etc.)
- Screenshots/logs nếu có

---

## 📝 Giấy Phép

Dự án này được cấp phép dưới MIT License. Xem [LICENSE](LICENSE) để chi tiết.

---

## 📞 Hỗ Trợ

Cho các vấn đề, câu hỏi hoặc đề xuất:

- **Issues**: [GitHub Issues](https://github.com/htrsng/Cyber-Defense-System/issues)
- **Email**: support@cyberdefense.local
- **Documentation**: Xem thư mục `/docs`

---

## 🙏 Lời Cảm Ơn

- MongoDB & Redis communities cho các cơ sở dữ liệu tuyệt vời
- Express.js và Socket.io teams cho các frameworks mạnh mẽ
- React community cho thư viện UI mạnh mẽ
- Security researchers cho threat intelligence

---

**Cập Nhật Cuối Cùng**: 15 Tháng 5, 2024  
**Phiên Bản**: 1.0.0  
**Trạng Thái**: Sản Xuất - Sẵn Sàng ✅
