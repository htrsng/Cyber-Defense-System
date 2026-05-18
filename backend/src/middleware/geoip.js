const geoip = require('geoip-lite');
const redis = require('../config/redis');
const { createLog } = require('../services/logService');
const ActivityLog = require('../models/ActivityLog');

const BLOCKED_COUNTRIES = (process.env.BLOCKED_COUNTRIES || 'KP,IR,CU,SY').split(',');
const BLOCKED_TOR = process.env.BLOCK_TOR === 'true';

const TOR_EXIT_NODES = [
    '185.220.101.1', '185.220.101.2', '162.247.74.74',
    '171.25.193.20', '51.15.43.205', '178.17.170.23',
    '193.11.114.43', '37.187.129.166', '77.247.181.162', '199.87.154.255',
];

async function getBlockedCountries() {
    const dynamicCountries = await redis.smembers('blocked_countries').catch(() => []);
    return Array.from(new Set([...BLOCKED_COUNTRIES, ...dynamicCountries].map(code => code.toUpperCase()).filter(Boolean)));
}

module.exports = async (req, res, next) => {
    const ip = req.ip?.replace('::ffff:', '') || '';

    // Skip private/local IPs
    const isPrivate = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|^$)/.test(ip);
    if (isPrivate) return next();

    // Check TOR
    if (BLOCKED_TOR && TOR_EXIT_NODES.includes(ip)) {
        await createLog({
            eventType: 'IP_BLOCKED',
            ipAddress: ip,
            endpoint: req.path,
            method: req.method,
            severity: 'high',
            metadata: { reason: 'TOR_EXIT_NODE', ip },
        }, req.app.get('io'));

        return res.status(403).json({
            error: 'Access denied',
            reason: 'TOR exit nodes are not allowed',
        });
    }

    // GeoIP lookup
    const geo = geoip.lookup(ip);
    const blockedCountries = await getBlockedCountries();

    if (geo && blockedCountries.includes(geo.country)) {
        const geoInfo = { country: geo.country, city: geo.city, region: geo.region, ll: geo.ll };

        await createLog({
            eventType: 'IP_BLOCKED',
            ipAddress: ip,
            endpoint: req.path,
            method: req.method,
            severity: 'medium',
            metadata: {
                reason: 'COUNTRY_BLOCKED',
                country: geo.country,
                city: geo.city,
                region: geo.region,
                ll: geo.ll,
            },
            geoInfo,
        }, req.app.get('io'));

        req.app.get('io')?.emit('security_alert', {
            type: 'GEOIP_BLOCKED',
            ipAddress: ip,
            severity: 'medium',
            riskScore: 45,
            description: `Access blocked from ${geo.country} (${geo.city || 'Unknown city'})`,
            timestamp: new Date(),
        });

        return res.status(403).json({
            error: 'Access denied',
            reason: `Access from ${geo.country} is not permitted`,
        });
    }

    // Attach geo info to request for logging
    if (geo) req.geoInfo = { country: geo.country, city: geo.city, region: geo.region, ll: geo.ll };

    next();
};