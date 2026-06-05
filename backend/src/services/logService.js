/**
 * Log Service
 * Ghi activity log + tính risk score + push real-time WebSocket
 * Đây là "trái tim" của hệ thống — mọi event đều đi qua đây
 */

const ActivityLog = require('../models/ActivityLog');
const geoip = require('geoip-lite');
const redis = require('../config/redis');
const { calculateRiskScore } = require('./riskScorer');
const { runAnomalyDetection } = require('./anomalyDetector');

// Event types cần trigger anomaly detection ngay lập tức
const HIGH_PRIORITY_EVENTS = new Set([
    'LOGIN_FAILED',
    'HONEYPOT_TRIGGERED',
    'RATE_LIMIT_HIT',
    'ATTACK_SIM_SQLI',
    'ATTACK_SIM_XSS',
    'ATTACK_SIM_BRUTE_FORCE',
]);

/**
 * Ghi log + tính risk score + emit WebSocket
 * @param {object} params
 * @param {object} io - Socket.io instance
 */
async function createLog({
    eventType,
    ipAddress,
    userId = null,
    websiteId = null,
    userAgent = '',
    endpoint = '',
    method = '',
    metadata = {},
    geoInfo = null,
    severity = 'info',
}, io) {
    const normalizedIp = String(ipAddress || '').replace('::ffff:', '');
    const geoLookup = geoInfo || geoip.lookup(normalizedIp) || null;
    const enrichedMetadata = {
        ...metadata,
    };

    if (geoLookup) {
        if (!enrichedMetadata.country && geoLookup.country) enrichedMetadata.country = geoLookup.country;
        if (!enrichedMetadata.city && geoLookup.city) enrichedMetadata.city = geoLookup.city;
        if (!enrichedMetadata.region && geoLookup.region) enrichedMetadata.region = geoLookup.region;
        if (!enrichedMetadata.ll && geoLookup.ll) enrichedMetadata.ll = geoLookup.ll;
    }

    // 1. Cập nhật Redis counters
    await updateRedisCounters(eventType, normalizedIp);

    // 2. Tính risk score real-time
    const { score, reasons, level } = await calculateRiskScore(normalizedIp);

    // 3. Tự động nâng severity nếu risk score cao
    const finalSeverity = autoSeverity(severity, score);

    // 4. Ghi vào MongoDB
    const log = await ActivityLog.create({
        eventType,
        ipAddress: normalizedIp,
        userId,
        websiteId,
        userAgent,
        endpoint,
        method,
        metadata: enrichedMetadata,
        riskScore: score,
        riskReasons: reasons,
        severity: finalSeverity,
    });

    // 5. Emit real-time tới dashboard
    io?.emit('activity_log', {
        _id: log._id,
        eventType,
        websiteId,
        ipAddress: normalizedIp,
        severity: finalSeverity,
        riskScore: score,
        riskLevel: level,
        reasons,
        endpoint,
        metadata: enrichedMetadata,
        timestamp: log.createdAt,
    });

    // 6. Nếu là high-priority event → trigger anomaly detection
    if (HIGH_PRIORITY_EVENTS.has(eventType)) {
        runAnomalyDetection(io).catch(console.error); // non-blocking
    }

    return log;
}

/**
 * Cập nhật Redis counters — dùng cho rate limiting & risk scoring
 */
async function updateRedisCounters(eventType, ip) {
    try {
        if (!redis || !redis.status || redis.status === 'end' || redis.status === 'close') return;

        const pipeline = redis.pipeline();
        const TTL_10M = 600;  // 10 phút
        const TTL_1H = 3600; // 1 giờ

        if (eventType === 'LOGIN_FAILED') {
            pipeline.incr(`failed_login:${ip}`);
            pipeline.expire(`failed_login:${ip}`, TTL_10M);
        }

        if (eventType === 'RATE_LIMIT_HIT') {
            pipeline.incr(`rate_limit_hit:${ip}`);
            pipeline.expire(`rate_limit_hit:${ip}`, TTL_1H);
        }

        // Tổng request counter
        pipeline.incr(`req_count:${ip}`);
        pipeline.expire(`req_count:${ip}`, TTL_1H);

        await pipeline.exec().catch(() => { });
    } catch (err) {
        console.warn('⚠️ Redis unavailable — skipping updateRedisCounters:', err.message || err);
    }
}

/**
 * Reset failed login counter khi đăng nhập thành công
 */
async function resetFailedLoginCounter(ip) {
    try {
        if (!redis || !redis.status || redis.status === 'end' || redis.status === 'close') return;
        await redis.del(`failed_login:${ip}`).catch(() => { });
    } catch (err) {
        console.warn('⚠️ Redis unavailable — skipping resetFailedLoginCounter:', err.message || err);
    }
}

/**
 * Tự động nâng severity dựa trên risk score
 */
function autoSeverity(originalSeverity, score) {
    if (score >= 80 && originalSeverity === 'info') return 'high';
    if (score >= 60 && originalSeverity === 'info') return 'medium';
    return originalSeverity;
}

module.exports = { createLog, resetFailedLoginCounter };
