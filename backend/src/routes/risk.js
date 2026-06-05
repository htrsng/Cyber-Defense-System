/**
 * Risk Score Routes
 * GET  /api/risk/:ip        — score cho 1 IP
 * POST /api/risk/batch      — score cho nhiều IPs
 * GET  /api/risk/top        — top 10 IPs nguy hiểm nhất
 */

const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');
const mongoose = require('mongoose');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { calculateRiskScore, batchCalculateRiskScore } = require('../services/riskScorer');
const { runAnomalyDetection } = require('../services/anomalyDetector');

// GET /api/risk/:ip — tính score cho 1 IP cụ thể
router.get('/:ip', async (req, res) => {
    try {
        const { ip } = req.params;
        const result = await calculateRiskScore(ip);

        res.json({
            ip,
            ...result,
            // Thêm context cho dashboard
            summary: buildSummary(result),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/risk/batch — tính score cho danh sách IPs
router.post('/batch', async (req, res) => {
    try {
        const { ips } = req.body;
        if (!Array.isArray(ips) || ips.length === 0) {
            return res.status(400).json({ error: 'ips array required' });
        }
        const results = await batchCalculateRiskScore(ips.slice(0, 50)); // max 50
        res.json({ results, count: results.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/risk/top — top IPs nguy hiểm nhất từ logs gần đây
router.get('/top/ips', async (req, res) => {
    try {
        // Lấy các IPs có activity trong 1 giờ qua
        const since = new Date(Date.now() - 60 * 60 * 1000);
        const query = { createdAt: { $gte: since } };
        if (req.query.websiteId) query.websiteId = req.query.websiteId;

        const activeIPs = await ActivityLog.distinct('ipAddress', query);

        const scored = await batchCalculateRiskScore(activeIPs);
        const top = scored.filter(r => r.score > 0).slice(0, 10);

        res.json({ top, total: activeIPs.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/risk/analyze — trigger manual anomaly scan (admin only)
router.post('/analyze', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const io = req.app.get('io');
        await runAnomalyDetection(io);
        res.json({ message: 'Anomaly detection completed', ts: new Date() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/risk/stats — thống kê tổng quan cho dashboard
router.get('/stats/overview', async (req, res) => {
    try {
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const logQuery = { createdAt: { $gte: since24h } };
        const criticalLogQuery = { severity: { $in: ['critical', 'high'] }, createdAt: { $gte: since24h } };
        const eventQuery = { resolved: false };
        const matchStage = { createdAt: { $gte: since24h } };

        if (req.query.websiteId) {
            const websiteIdObj = new mongoose.Types.ObjectId(req.query.websiteId);
            logQuery.websiteId = req.query.websiteId;
            criticalLogQuery.websiteId = req.query.websiteId;
            eventQuery.websiteId = req.query.websiteId;
            matchStage.websiteId = websiteIdObj;
        }

        const [
            totalEvents,
            criticalEvents,
            unresolvedThreats,
            topEventTypes,
        ] = await Promise.all([
            ActivityLog.countDocuments(logQuery),
            ActivityLog.countDocuments(criticalLogQuery),
            SecurityEvent.countDocuments(eventQuery),
            ActivityLog.aggregate([
                { $match: matchStage },
                { $group: { _id: '$eventType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);

        res.json({
            last24h: { totalEvents, criticalEvents },
            unresolvedThreats,
            topEventTypes,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildSummary({ score, level, reasons, signals }) {
    if (score === 0) return 'No suspicious activity detected.';
    const top = reasons.slice(0, 2).join('; ');
    return `${level.toUpperCase()} risk (${score}/100) — ${top}${reasons.length > 2 ? ` +${reasons.length - 2} more` : ''}.`;
}

module.exports = router;
