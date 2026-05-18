const express = require('express');
const redis = require('../config/redis');

const router = express.Router();

router.get('/status', async (_req, res) => {
    try {
        const keys = await redis.keys('tarpit:*');
        const results = await Promise.all(
            keys.map(async (key) => {
                const ip = key.replace('tarpit:', '');
                const score = await redis.get(key);
                const ttl = await redis.ttl(key);
                return { ip, riskScore: parseInt(score, 10), ttl };
            })
        );

        return res.json({ tarpit: results, tarpitted: results, count: results.length });
    } catch (error) {
        console.error('Failed to fetch tarpit status:', error);
        return res.status(500).json({ error: 'Failed to fetch tarpit status' });
    }
});

router.delete('/clear/:ip', async (req, res) => {
    try {
        const { ip } = req.params;
        await redis.del(`tarpit:${ip}`);
        return res.json({ message: `${ip} removed from tarpit` });
    } catch (error) {
        console.error('Failed to clear tarpit entry:', error);
        return res.status(500).json({ error: 'Failed to clear tarpit entry' });
    }
});

router.post('/force/:ip', async (req, res) => {
    try {
        const { ip } = req.params;
        const score = Number(req.body?.score ?? req.query?.score ?? 75) || 75;
        await redis.setex(`tarpit:${ip}`, 300, String(score));
        return res.json({ message: `${ip} tarpitted for 5 minutes` });
    } catch (error) {
        console.error('Failed to force tarpit entry:', error);
        return res.status(500).json({ error: 'Failed to force tarpit entry' });
    }
});

module.exports = router;