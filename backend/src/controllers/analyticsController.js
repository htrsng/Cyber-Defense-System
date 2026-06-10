const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');

exports.getAttacks = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        // Group attacks by type
        const byType = await SecurityEvent.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // Trend over last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trend = await SecurityEvent.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            byType: byType.map(b => ({ name: b._id, value: b.count })),
            trend: trend.map(t => ({ date: t._id, count: t.count }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch attack analytics' });
    }
};

exports.getFraud = async (req, res) => {
    try {
        // Mock fraud data based on critical events
        const criticalEvents = await ActivityLog.countDocuments({ severity: 'critical' });
        
        res.json({
            attemptsDetected: criticalEvents,
            attemptsPrevented: Math.floor(criticalEvents * 0.95), // 95% prevention rate mock
            valuePrevented: Math.floor(criticalEvents * 0.95) * 500000,
            riskDistribution: [
                { range: '0-20', count: 1200 },
                { range: '21-50', count: 450 },
                { range: '51-80', count: 120 },
                { range: '81-100', count: criticalEvents }
            ]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch fraud analytics' });
    }
};

exports.getOverview = async (req, res) => {
    try {
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch overview' });
    }
};
