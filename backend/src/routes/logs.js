const express = require('express');
const router  = express.Router();
const ActivityLog = require('../models/ActivityLog');

router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.websiteId) {
            query.websiteId = req.query.websiteId;
        }
        const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
        res.json({ logs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/recent', async (req, res) => {
    try {
        const query = {};
        if (req.query.websiteId) {
            query.websiteId = req.query.websiteId;
        }
        const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
        res.json({ logs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', (req, res) => res.json({ data: [], message: 'coming soon' }));

module.exports = router;
