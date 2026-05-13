const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');
const redis = require('../config/redis');
const { calculateRiskScore } = require('../services/riskScorer');

const delay = ms => new Promise(res => setTimeout(res, ms));

function normalizeLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    if (score >= 15) return 'low';
    return 'safe';
}

async function bruteForce(req, res, io) {
    try {
        const attempts = Math.max(5, Math.min(50, Number(req.body.attempts) || 0));
        const delayMs = Math.max(50, Math.min(1000, Number(req.body.delayMs) || 0));
        const attackerIp = '10.0.0.99';

        for (let i = 1; i <= attempts; i += 1) {
            await ActivityLog.create({
                eventType: 'ATTACK_SIM_BRUTE_FORCE',
                ipAddress: attackerIp,
                severity: 'high',
                metadata: {
                    attempt: i,
                    password: `fakepass${i}`,
                },
            });

            if (i % 5 === 0) {
                await redis.incrby(`failed_login:${attackerIp}`, 5);
                await redis.expire(`failed_login:${attackerIp}`, 600);
            }

            if (i < attempts) {
                await delay(delayMs);
            }
        }

        const risk = await calculateRiskScore(attackerIp);
        const finalRiskScore = risk.score;
        const level = risk.level;
        const blocked = finalRiskScore >= 60;

        if (blocked) {
            await redis.set(`blocked_ip:${attackerIp}`, '1', 'EX', 300);
        }

        if (io) {
            io.emit('security_alert', {
                type: 'BRUTE_FORCE_DETECTED',
                ipAddress: attackerIp,
                riskScore: finalRiskScore,
                severity: level,
                reasons: risk.reasons,
            });
        }

        return res.json({
            attempts,
            finalRiskScore,
            level,
            blocked,
            reasons: risk.reasons,
        });
    } catch (error) {
        console.error('Brute force simulation error:', error);
        return res.status(500).json({ error: 'Failed to run brute force simulation' });
    }
}

async function sqli(req, res, io) {
    try {
        const attackerIp = '10.0.0.88';
        const payloads = [
            "' OR 1=1 --",
            "' UNION SELECT * FROM users --",
            "'; DROP TABLE logs; --",
            "admin'--",
            "' OR 'x'='x",
        ];

        for (const payload of payloads) {
            await ActivityLog.create({
                eventType: 'ATTACK_SIM_SQLI',
                ipAddress: attackerIp,
                severity: 'high',
                metadata: {
                    payload,
                    endpoint: '/api/auth/login',
                    blocked: true,
                },
            });
        }

        const risk = await calculateRiskScore(attackerIp);

        if (io) {
            io.emit('security_alert', {
                type: 'SQLI_DETECTED',
                ipAddress: attackerIp,
                riskScore: risk.score,
                severity: risk.level,
                reasons: risk.reasons,
            });
        }

        return res.json({
            payloadsTested: payloads.length,
            riskScore: risk.score,
            level: risk.level,
            payloads,
        });
    } catch (error) {
        console.error('SQLi simulation error:', error);
        return res.status(500).json({ error: 'Failed to run SQLi simulation' });
    }
}

async function honeypot(req, res, io) {
    try {
        const attackerIp = '10.0.0.77';
        const endpoints = ['/ .env'];
        // Replace with the exact honeypot paths requested below.
        const honeypotPaths = ['/.env', '/admin/secret', '/wp-admin', '/admin/backup', '/phpmyadmin'];

        for (const endpoint of honeypotPaths) {
            await ActivityLog.create({
                eventType: 'HONEYPOT_TRIGGERED',
                ipAddress: attackerIp,
                severity: 'critical',
                riskScore: 95,
                riskReasons: ['Accessed honeypot endpoint', 'Attacker reconnaissance'],
                metadata: {
                    endpoint,
                    method: 'GET',
                },
            });

            await SecurityEvent.create({
                type: 'HONEYPOT_ACCESS',
                ipAddress: attackerIp,
                description: `Honeypot endpoint accessed: ${endpoint}`,
                severity: 'critical',
                riskScore: 95,
                evidence: {
                    endpoint,
                    method: 'GET',
                },
            });

            if (io) {
                io.emit('security_alert', {
                    type: 'HONEYPOT_ACCESS',
                    ipAddress: attackerIp,
                    riskScore: 95,
                    severity: 'critical',
                    endpoint,
                });
            }
        }

        return res.json({
            endpointsHit: honeypotPaths.length,
            riskScore: 95,
            level: 'critical',
            endpoints: honeypotPaths,
        });
    } catch (error) {
        console.error('Honeypot simulation error:', error);
        return res.status(500).json({ error: 'Failed to run honeypot simulation' });
    }
}

module.exports = {
    bruteForce,
    sqli,
    honeypot,
};