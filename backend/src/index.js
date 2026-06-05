require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const redis = require('./config/redis');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');

// Global security toggle for demo mode (Before & After scenario)
global.IS_SECURITY_ENABLED = false;

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4000',
  'http://localhost:4001',
];

const envOrigins = [process.env.FRONTEND_URL, process.env.PAYGUARD_URL]
  .filter(Boolean)
  .map((origin) => {
    if (/^https?:\/\//i.test(origin)) {
      return origin;
    }
    return `http://${origin}`;
  });

const allowedOriginSet = new Set([...allowedOrigins, ...envOrigins]);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOriginSet.has(origin)) return true;
  return /^http:\/\/localhost:\d+$/.test(origin);
}

app.set('trust proxy', true);

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; object-src 'none'; base-uri 'self'"
  );
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Socket.io — real-time push tới dashboard
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
app.set('io', io); // chia sẻ io instance cho toàn bộ service

// Conditional middleware wrapper for security checks
// When global.IS_SECURITY_ENABLED === false, skip security-related middleware
const conditionalSecurityMiddleware = (securityMiddleware) => {
  return (req, res, next) => {
    if (!global.IS_SECURITY_ENABLED) {
      // Security disabled - skip this middleware and proceed directly
      return next();
    }
    // Security enabled - run the middleware
    securityMiddleware(req, res, next);
  };
};

// Middleware
app.use(helmet());
app.use(require('./middleware/geoip'));
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('combined'));
app.use(conditionalSecurityMiddleware(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.GLOBAL_RATE_LIMIT_MAX || 1000),
  standardHeaders: true,
  legacyHeaders: false,
})));
app.use(conditionalSecurityMiddleware(require('./middleware/tarpit')));
app.use(conditionalSecurityMiddleware(require('./middleware/waf')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/2fa', require('./routes/twoFactor'));
app.use('/api/tarpit', authMiddleware, adminMiddleware, require('./routes/tarpit'));
app.use('/api/geoip', authMiddleware, adminMiddleware, require('./routes/geoip'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/simulate', require('./routes/simulate'));
app.use('/api/risk', require('./routes/risk'));
app.use('/api/demo', require('./routes/demo'));
app.use('/api/payguard', require('./routes/payguard'));
app.use('/api/xss', require('./routes/xss'));
app.use('/api/reports', authMiddleware, require('./routes/reports'));
app.use('/api/admin', authMiddleware, adminMiddleware, require('./routes/admin'));
app.use('/api/websites', require('./routes/websites'));
app.use('/api/sdk', require('./routes/sdk'));

// Honeypot endpoints — bẫy reconnaissance
app.all('/admin/secret', require('./middleware/honeypot'));
app.all('/admin/backup', require('./middleware/honeypot'));
app.all('/.env', require('./middleware/honeypot'));
app.all('/wp-admin', require('./middleware/honeypot'));
app.all('/phpmyadmin', require('./middleware/honeypot'));
app.all('/admin/config.json', require('./middleware/honeypot'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

io.on('connection', (socket) => {
  console.log('📡 Dashboard connected:', socket.id);
  socket.on('disconnect', () => console.log('📡 Dashboard disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
const { runAnomalyDetection } = require('./services/anomalyDetector');
const { sendDailyReport } = require('./services/emailService');

// Function to calculate milliseconds until midnight
function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

(async () => {
  await connectDB();
  try {
    await redis.connect();
  } catch (err) {
    console.warn('⚠️ Redis not available, continuing without Redis caching:', err.message || err);
  }
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🍯 Honeypot endpoints active`);

    // Chạy anomaly detection mỗi 2 phút
    setInterval(() => {
      runAnomalyDetection(io).catch(console.error);
    }, 2 * 60 * 1000);

    console.log(`🤖 Anomaly detector scheduled (every 2 min)`);

    // Schedule daily report at midnight
    setTimeout(async function scheduleDailyReport() {
      try {
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [totalEvents, criticalEvents] = await Promise.all([
          require('./models/ActivityLog').countDocuments({ createdAt: { $gte: since24h } }),
          require('./models/ActivityLog').countDocuments({ severity: { $in: ['critical', 'high'] }, createdAt: { $gte: since24h } }),
        ]);

        const topIPs = await require('./models/SecurityEvent').aggregate([
          { $match: { createdAt: { $gte: since24h } } },
          { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { ipAddress: '$_id', count: 1, _id: 0 } },
        ]);

        const unresolvedThreats = await require('./models/SecurityEvent').countDocuments({
          resolved: false,
          severity: { $in: ['critical', 'high'] },
        });

        await sendDailyReport({
          totalEvents,
          criticalEvents,
          topIPs,
          unresolvedThreats,
        }).catch(console.error);

        console.log('📊 Daily report sent');
      } catch (err) {
        console.error('Daily report scheduling error:', err.message);
      }

      // Schedule next report for tomorrow at midnight
      setTimeout(scheduleDailyReport, 24 * 60 * 60 * 1000);
    }, msUntilMidnight());

    console.log(`📊 Daily report scheduler active`);
  });
})();
