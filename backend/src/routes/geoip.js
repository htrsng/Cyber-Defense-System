const express = require('express');
const geoip = require('geoip-lite');
const redis = require('../config/redis');

const router = express.Router();
const BLOCKED_COUNTRIES = (process.env.BLOCKED_COUNTRIES || 'KP,IR,CU,SY').split(',').map(code => code.toUpperCase());

async function getCurrentBlockedCountries() {
    const dynamicCountries = await redis.smembers('blocked_countries').catch(() => []);
    return Array.from(new Set([...BLOCKED_COUNTRIES, ...dynamicCountries].map(code => code.toUpperCase()).filter(Boolean)));
}

function normalizeCountryCode(countryCode) {
    return String(countryCode || '').trim().toUpperCase();
}

router.get('/lookup/:ip', async (req, res) => {
    try {
        const ip = req.params.ip;
        const geo = geoip.lookup(ip);
        const blockedCountries = await getCurrentBlockedCountries();

        return res.json({
            ip,
            geo,
            blocked: Boolean(geo?.country && blockedCountries.includes(geo.country)),
        });
    } catch (error) {
        console.error('GeoIP lookup error:', error);
        return res.status(500).json({ error: 'Failed to lookup IP' });
    }
});

router.get('/blocked-countries', async (req, res) => {
    try {
        const blockedCountries = await getCurrentBlockedCountries();
        return res.json({ blockedCountries });
    } catch (error) {
        console.error('GeoIP blocked countries error:', error);
        return res.status(500).json({ error: 'Failed to fetch blocked countries' });
    }
});

router.post('/block-country', async (req, res) => {
    try {
        const countryCode = normalizeCountryCode(req.body.countryCode);

        if (!countryCode || countryCode.length !== 2) {
            return res.status(400).json({ error: 'Invalid country code' });
        }

        await redis.sadd('blocked_countries', countryCode);

        return res.json({
            message: 'Country added to blocklist',
            country: countryCode,
        });
    } catch (error) {
        console.error('GeoIP block country error:', error);
        return res.status(500).json({ error: 'Failed to block country' });
    }
});

router.post('/unblock-country', async (req, res) => {
    try {
        const countryCode = normalizeCountryCode(req.body.countryCode);

        if (!countryCode || countryCode.length !== 2) {
            return res.status(400).json({ error: 'Invalid country code' });
        }

        await redis.srem('blocked_countries', countryCode);

        return res.json({
            message: 'Country removed from blocklist',
            country: countryCode,
        });
    } catch (error) {
        console.error('GeoIP unblock country error:', error);
        return res.status(500).json({ error: 'Failed to unblock country' });
    }
});

module.exports = router;