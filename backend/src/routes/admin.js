/**
 * Admin Routes
 * Requires JWT authentication + admin role
 */

const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth');
const SecurityEvent = require('../models/SecurityEvent');
const { sendCriticalAlert, sendDailyReport, testEmail } = require('../services/emailService');
const ActivityLog = require('../models/ActivityLog');

// ─── Email Config Endpoint ────────────────────────────────────────────────

/**
 * GET /api/admin/email-config
 * Get email configuration status
 */
router.get('/email-config', adminMiddleware, (req, res) => {
  try {
    const emailFrom = process.env.EMAIL_FROM || '';
    const emailAppPassword = process.env.EMAIL_APP_PASSWORD || '';
    const configured = !!(emailFrom && emailAppPassword);

    // Mask email address for security
    const maskedEmail = emailFrom
      ? emailFrom.replace(/(.{3}).*(@.*)/, '$1***$2')
      : null;

    return res.json({
      configured,
      from: maskedEmail,
      to: process.env.EMAIL_TO || null,
    });
  } catch (error) {
    console.error('Email config fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch email config',
      details: error.message,
    });
  }
});

// ─── Test Email Endpoint ───────────────────────────────────────────────────

/**
 * POST /api/admin/test-email
 * Send a test email to verify email service configuration
 */
router.post('/test-email', adminMiddleware, async (req, res) => {
  try {
    const result = await testEmail();
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message,
    });
  }
});

// ─── Daily Report Endpoint ─────────────────────────────────────────────────

/**
 * POST /api/admin/daily-report
 * Send a daily summary email with threat statistics
 */
router.post('/daily-report', adminMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total events for today
    const totalEvents = await SecurityEvent.countDocuments({
      createdAt: { $gte: today },
    });

    // Get critical events for today
    const criticalEvents = await SecurityEvent.countDocuments({
      severity: 'critical',
      createdAt: { $gte: today },
    });

    // Get top threat IPs
    const topIPs = await SecurityEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          ipAddress: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Get unresolved threats
    const unresolvedThreats = await SecurityEvent.countDocuments({
      resolved: false,
      severity: { $in: ['critical', 'high'] },
    });

    const stats = {
      totalEvents,
      criticalEvents,
      topIPs,
      unresolvedThreats,
    };

    await sendDailyReport(stats);

    return res.json({
      success: true,
      message: 'Daily report email sent successfully',
      stats,
    });
  } catch (error) {
    console.error('Daily report error:', error);
    return res.status(500).json({
      error: 'Failed to send daily report',
      details: error.message,
    });
  }
});

module.exports = router;
