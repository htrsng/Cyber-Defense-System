/**
 * SDK Event Routes
 * Nhận events từ CyberDef SDK nhúng trên website khách hàng
 * Xác thực bằng API Key (X-CyberDef-Key header)
 */

const express = require('express');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { createLog } = require('../services/logService');
const { calculateRiskScore } = require('../services/riskScorer');
const Website = require('../models/Website');

const router = express.Router();

// Allowed SDK event types
const SDK_EVENT_TYPES = new Set([
  'LOGIN_FAILED',
  'LOGIN_SUCCESS',
  'XSS_ATTEMPT',
  'BOT_DETECTED',
  'SUSPICIOUS_ACTIVITY',
  'FORM_SPAM',
  'RATE_LIMIT_HIT',
  'HONEYPOT_TRIGGERED',
]);

/**
 * POST /api/sdk/event
 * Nhận event từ SDK, ghi log, tính risk score, trả kết quả cho SDK
 */
router.post('/event', apiKeyAuth, async (req, res) => {
  try {
    const { type, fingerprint, metadata = {}, userAgent } = req.body;

    // Validate event type
    if (!type || !SDK_EVENT_TYPES.has(type)) {
      return res.status(400).json({
        error: 'Invalid event type',
        allowed: Array.from(SDK_EVENT_TYPES),
      });
    }

    // Get real IP from request (not from client-side to prevent spoofing)
    const clientIP = String(req.ip || req.headers['x-forwarded-for'] || '127.0.0.1')
      .replace('::ffff:', '');

    const io = req.app.get('io');

    // Create activity log with website context
    await createLog({
      eventType: type,
      ipAddress: clientIP,
      userAgent: userAgent || req.headers['user-agent'] || '',
      endpoint: metadata.endpoint || metadata.page || '/',
      method: 'SDK',
      metadata: {
        ...metadata,
        fingerprint: fingerprint || {},
        source: 'sdk',
        websiteDomain: req.website.domain,
        websiteName: req.website.websiteName,
      },
      severity: getSeverity(type),
      websiteId: req.website._id,
    }, io);

    // Calculate current risk score for this IP
    const { score, level, reasons } = await calculateRiskScore(clientIP);

    // Determine if IP should be blocked
    const blocked = score >= 80;

    // Update website blocked counter
    if (blocked) {
      await Website.findByIdAndUpdate(req.website._id, {
        $inc: { totalEventsBlocked: 1 },
      });
    }

    return res.json({
      received: true,
      blocked,
      riskScore: score,
      riskLevel: level,
      reasons: blocked ? reasons : undefined, // Only show reasons if blocked
      action: blocked ? 'block' : score >= 40 ? 'warn' : 'allow',
    });
  } catch (error) {
    console.error('SDK event error:', error);
    return res.status(500).json({ error: 'Failed to process event' });
  }
});

/**
 * GET /api/sdk/status
 * SDK health check + website info
 */
router.get('/status', apiKeyAuth, async (req, res) => {
  return res.json({
    status: 'active',
    website: {
      name: req.website.websiteName,
      domain: req.website.domain,
      plan: req.website.plan,
    },
    usage: {
      daily: req.website.dailyRequestCount,
      limit: req.website.dailyRequestLimit,
      remaining: Math.max(0, req.website.dailyRequestLimit - req.website.dailyRequestCount),
    },
  });
});

/**
 * GET /api/sdk/stats
 * Public stats for landing page counter
 */
router.get('/global-stats', async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalBlocked, totalWebsites, totalEvents] = await Promise.all([
      ActivityLog.countDocuments({
        severity: { $in: ['high', 'critical'] },
        createdAt: { $gte: since24h },
      }),
      Website.countDocuments({ status: 'active' }),
      ActivityLog.countDocuments({ createdAt: { $gte: since24h } }),
    ]);

    return res.json({
      attacksBlocked24h: totalBlocked,
      websitesProtected: totalWebsites,
      eventsProcessed24h: totalEvents,
    });
  } catch (error) {
    console.error('Global stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Map event type → severity
 */
function getSeverity(eventType) {
  const map = {
    LOGIN_FAILED: 'medium',
    LOGIN_SUCCESS: 'info',
    XSS_ATTEMPT: 'critical',
    BOT_DETECTED: 'high',
    SUSPICIOUS_ACTIVITY: 'medium',
    FORM_SPAM: 'low',
    RATE_LIMIT_HIT: 'medium',
    HONEYPOT_TRIGGERED: 'critical',
  };
  return map[eventType] || 'info';
}

module.exports = router;
