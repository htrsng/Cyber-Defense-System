/**
 * API Key Authentication Middleware
 * Xác thực request từ SDK/Script nhúng bằng API Key
 * Header: X-CyberDef-Key: cdf_live_abc123...
 */

const Website = require('../models/Website');

/**
 * Middleware xác thực API Key cho SDK endpoints
 * Gắn req.website nếu key hợp lệ
 */
async function apiKeyAuth(req, res, next) {
  try {
    const apiKey = req.headers['x-cyberdef-key'] || req.query.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        hint: 'Add header X-CyberDef-Key or query param ?apiKey=',
      });
    }

    // Validate key format
    if (!apiKey.startsWith('cdf_live_')) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }

    // Look up website by API key
    const website = await Website.findOne({ apiKey, status: 'active' });

    if (!website) {
      return res.status(403).json({ error: 'Invalid or suspended API key' });
    }

    // Check daily request limit
    const allowed = await website.incrementRequest();
    if (!allowed) {
      return res.status(429).json({
        error: 'Daily request limit exceeded',
        limit: website.dailyRequestLimit,
        plan: website.plan,
        upgrade: 'Upgrade to Pro for 50,000 requests/day',
      });
    }

    // Attach website info to request
    req.website = website;
    req.websiteId = website._id;

    next();
  } catch (error) {
    console.error('API Key auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional API Key middleware — nếu có key thì validate, không có thì cho qua
 * Dùng cho endpoints vừa hỗ trợ SDK vừa hỗ trợ internal
 */
async function optionalApiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-cyberdef-key'] || req.query.apiKey;

  if (!apiKey) {
    return next(); // No key provided, proceed without website context
  }

  // If key provided, validate it
  return apiKeyAuth(req, res, next);
}

module.exports = { apiKeyAuth, optionalApiKeyAuth };
