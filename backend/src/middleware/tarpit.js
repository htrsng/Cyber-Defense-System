const redis = require('../config/redis');
const { calculateRiskScore } = require('../services/riskScorer');

const TARPIT_THRESHOLD = 40; // risk score >= 40 → tarpit
const BLOCK_THRESHOLD = 80; // risk score >= 80 → block hoàn toàn
const MIN_DELAY_MS = 3000; // 3 giây minimum
const MAX_DELAY_MS = 30000; // 30 giây maximum

function calculateDelay(riskScore) {
    if (riskScore >= BLOCK_THRESHOLD) return MAX_DELAY_MS;
    const ratio = (riskScore - TARPIT_THRESHOLD) / (BLOCK_THRESHOLD - TARPIT_THRESHOLD);
    return Math.floor(MIN_DELAY_MS + ratio * (MAX_DELAY_MS - MIN_DELAY_MS));
}

module.exports = async (req, res, next) => {
    const ip = req.ip?.replace('::ffff:', '') || '';

    // Only tarpit login + sensitive endpoints
    const TARPIT_PATHS = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/xss/vulnerable',
    ];

    if (!TARPIT_PATHS.some((path) => req.path.startsWith(path))) return next();

    // Check if IP is in tarpit Redis cache (avoid re-calculating every request)
    const cachedScore = await redis.get(`tarpit:${ip}`).catch(() => null);
    let riskScore = cachedScore ? parseInt(cachedScore, 10) : 0;

    if (!cachedScore) {
        riskScore = (await calculateRiskScore(ip).catch(() => ({ score: 0 }))).score;
    } else if (riskScore >= TARPIT_THRESHOLD && riskScore < BLOCK_THRESHOLD) {
        const freshScore = (await calculateRiskScore(ip).catch(() => ({ score: 0 }))).score;
        riskScore = Math.max(riskScore, freshScore);
    }

    // Cache for 5 minutes
    if ((!cachedScore && riskScore > 0) || (cachedScore && riskScore > parseInt(cachedScore, 10))) {
        await redis.setex(`tarpit:${ip}`, 300, riskScore).catch(() => { });
    }

    // Below threshold — no tarpit
    if (riskScore < TARPIT_THRESHOLD) return next();

    const delayMs = calculateDelay(riskScore);
    const io = req.app.get('io');

    // Emit tarpit event to dashboard
    io?.emit('tarpit_active', {
        ipAddress: ip,
        riskScore,
        delayMs,
        endpoint: req.path,
        timestamp: new Date(),
    });

    console.log(`🕸 TARPIT: ${ip} (score:${riskScore}) → delayed ${delayMs}ms`);

    // The actual delay — attacker waits, server is fine
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // After delay, if score >= BLOCK_THRESHOLD → block completely
    if (riskScore >= BLOCK_THRESHOLD) {
        return res.status(429).json({
            error: 'Too many suspicious requests',
            retryAfter: 300,
        });
    }

    next();
};