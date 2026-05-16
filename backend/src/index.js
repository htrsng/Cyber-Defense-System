require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const redis = require('./config/redis');

const app = express();
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

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
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});
app.set('io', io); // chia sẻ io instance cho toàn bộ service

// Middleware
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/2fa', require('./routes/twoFactor'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/events', require('./routes/events'));
app.use('/api/simulate', require('./routes/simulate'));
app.use('/api/risk', require('./routes/risk'));
app.use('/api/xss', require('./routes/xss'));

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

(async () => {
  await connectDB();
  await redis.connect();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🍯 Honeypot endpoints active`);

    // Chạy anomaly detection mỗi 2 phút
    setInterval(() => {
      runAnomalyDetection(io).catch(console.error);
    }, 2 * 60 * 1000);

    console.log(`🤖 Anomaly detector scheduled (every 2 min)`);
  });
})();
