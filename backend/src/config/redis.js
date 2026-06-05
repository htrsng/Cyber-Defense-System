const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

redis.on('connect',   () => console.log('✅ Redis connected'));
redis.on('error', (e) => console.error('❌ Redis error:', e.message));

module.exports = redis;
