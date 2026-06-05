/**
 * Website Registration & Management Routes
 * Cho phép user đăng ký website, lấy API key, quản lý sites
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Website = require('../models/Website');

const router = express.Router();

/**
 * POST /api/websites/register
 * Đăng ký website mới → nhận API Key
 */
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { websiteName, domain } = req.body;

    if (!websiteName || !domain) {
      return res.status(400).json({ error: 'websiteName and domain are required' });
    }

    // Check duplicate domain for same user
    const existing = await Website.findOne({
      domain: domain.toLowerCase(),
      ownerId: req.user.userId,
    });
    if (existing) {
      return res.status(409).json({
        error: 'Domain already registered',
        apiKey: existing.apiKey,
      });
    }

    const apiKey = Website.generateApiKey();

    const website = await Website.create({
      websiteName,
      domain: domain.toLowerCase(),
      apiKey,
      ownerId: req.user.userId,
      plan: 'free',
      dailyRequestLimit: Website.getPlanLimit('free'),
    });

    return res.status(201).json({
      message: 'Website registered successfully',
      website: {
        id: website._id,
        websiteName: website.websiteName,
        domain: website.domain,
        apiKey: website.apiKey,
        plan: website.plan,
        dailyRequestLimit: website.dailyRequestLimit,
        status: website.status,
      },
      integration: {
        scriptTag: `<script src="${process.env.FRONTEND_URL || 'http://localhost:3000'}/sdk/cyberdef-sdk.js" data-key="${apiKey}"></script>`,
        apiEndpoint: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/sdk/event`,
        apiKeyHeader: 'X-CyberDef-Key',
      },
    });
  } catch (error) {
    console.error('Website register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /api/websites/my-sites
 * Danh sách website của user hiện tại
 */
router.get('/my-sites', authMiddleware, async (req, res) => {
  try {
    const websites = await Website.find({ ownerId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      websites: websites.map(w => ({
        id: w._id,
        websiteName: w.websiteName,
        domain: w.domain,
        apiKey: w.apiKey,
        plan: w.plan,
        status: w.status,
        dailyRequestCount: w.dailyRequestCount,
        dailyRequestLimit: w.dailyRequestLimit,
        totalEventsBlocked: w.totalEventsBlocked,
        totalEventsLogged: w.totalEventsLogged,
        createdAt: w.createdAt,
      })),
      count: websites.length,
    });
  } catch (error) {
    console.error('List websites error:', error);
    return res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

/**
 * POST /api/websites/:id/regenerate-key
 * Tạo lại API Key cho website
 */
router.post('/:id/regenerate-key', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    website.apiKey = Website.generateApiKey();
    await website.save();

    return res.json({
      message: 'API key regenerated',
      apiKey: website.apiKey,
      warning: 'Update the API key in your website integration code',
    });
  } catch (error) {
    console.error('Regenerate key error:', error);
    return res.status(500).json({ error: 'Failed to regenerate key' });
  }
});

/**
 * GET /api/websites/:id/stats
 * Thống kê cho 1 website
 */
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Get recent activity logs for this website
    const ActivityLog = require('../models/ActivityLog');
    const SecurityEvent = require('../models/SecurityEvent');

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalEvents, criticalEvents, unresolvedThreats] = await Promise.all([
      ActivityLog.countDocuments({ websiteId: website._id, createdAt: { $gte: since24h } }),
      ActivityLog.countDocuments({ websiteId: website._id, severity: 'critical', createdAt: { $gte: since24h } }),
      SecurityEvent.countDocuments({ websiteId: website._id, resolved: false }),
    ]);

    return res.json({
      website: {
        id: website._id,
        websiteName: website.websiteName,
        domain: website.domain,
        plan: website.plan,
      },
      stats: {
        last24h: { totalEvents, criticalEvents },
        unresolvedThreats,
        dailyRequestCount: website.dailyRequestCount,
        dailyRequestLimit: website.dailyRequestLimit,
        totalEventsBlocked: website.totalEventsBlocked,
        totalEventsLogged: website.totalEventsLogged,
      },
    });
  } catch (error) {
    console.error('Website stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * DELETE /api/websites/:id
 * Xóa website
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.userId,
    });

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    return res.json({ message: 'Website deleted', domain: website.domain });
  } catch (error) {
    console.error('Delete website error:', error);
    return res.status(500).json({ error: 'Failed to delete website' });
  }
});

module.exports = router;
