const express = require('express');
const SecurityEvent = require('../models/SecurityEvent');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/events — query security events with filtering
router.get('/', async (req, res) => {
    try {
        const { resolved, type } = req.query;
        const filter = {};

        if (resolved !== undefined) {
            filter.resolved = resolved === 'true';
        }

        if (type) {
            filter.type = type;
        }

        if (req.query.websiteId) {
            filter.websiteId = req.query.websiteId;
        }

        const events = await SecurityEvent.find(filter)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        const count = await SecurityEvent.countDocuments(filter);

        return res.json({ events, count });
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// PATCH /api/events/:id/resolve — mark event as resolved (admin only)
router.patch('/:id/resolve', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const event = await SecurityEvent.findByIdAndUpdate(
            req.params.id,
            {
                resolved: true,
                resolvedAt: new Date()
            },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        return res.json({ message: 'Resolved', event });
    } catch (error) {
        console.error('Failed to resolve event:', error);
        return res.status(500).json({ error: 'Failed to resolve event' });
    }
});

module.exports = router;
