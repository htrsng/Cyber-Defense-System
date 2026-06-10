/**
 * AI Risk Scorer — Rule-based engine
 * Tính điểm nguy cơ (0-100) cho một IP address
 * Output: { score, level, reasons, signals }
 */

const redis = require('../config/redis');
const ActivityLog = require('../models/ActivityLog');

// ─── Định nghĩa các rules ────────────────────────────────────────────────────

const RULES = [
    {
        id: 'BRUTE_FORCE_MODERATE',
        label: 'Multiple failed logins (≥5 in 10 min)',
        weight: 40,
        factor: 'Request Velocity',
        async evaluate({ ip, windowCounts }) {
            return windowCounts.failedLogins10m >= 5;
        },
    },
    {
        id: 'BRUTE_FORCE_AGGRESSIVE',
        label: 'Aggressive brute force (≥10 failed logins)',
        weight: 20,
        factor: 'Request Velocity',
        async evaluate({ ip, windowCounts }) {
            return windowCounts.failedLogins10m >= 10;
        },
    },
    {
        id: 'BRUTE_FORCE_LOCKDOWN',
        label: 'Sustained brute force (≥7 failed logins)',
        weight: 40,
        factor: 'Request Velocity',
        async evaluate({ windowCounts }) {
            return windowCounts.failedLogins10m >= 7;
        },
    },
    {
        id: 'HONEYPOT_ACCESS',
        label: 'Accessed honeypot endpoint (attacker reconnaissance)',
        weight: 35,
        factor: 'IP Reputation',
        async evaluate({ recentLogs }) {
            return recentLogs.some(l => l.eventType === 'HONEYPOT_TRIGGERED');
        },
    },
    {
        id: 'RATE_LIMIT_ABUSE',
        label: 'Repeatedly triggered rate limiter (automated tool likely)',
        weight: 20,
        factor: 'Request Velocity',
        async evaluate({ windowCounts }) {
            return windowCounts.rateLimitHits >= 3;
        },
    },
    {
        id: 'SQLI_ATTEMPT',
        label: 'SQL injection payload detected in requests',
        weight: 35, // modified to match the max score
        factor: 'SQLi Payload',
        async evaluate({ recentLogs }) {
            return recentLogs.some(l => l.eventType === 'ATTACK_SIM_SQLI');
        },
    },
    {
        id: 'XSS_ATTEMPT',
        label: 'XSS payload detected in requests',
        weight: 35,
        factor: 'XSS Payload',
        async evaluate({ recentLogs }) {
            return recentLogs.some(l => l.eventType === 'ATTACK_SIM_XSS');
        },
    },
    {
        id: 'MULTIPLE_ATTACK_TYPES',
        label: 'Multiple attack types detected from same IP (coordinated attack)',
        weight: 20,
        factor: 'Behavioral Analysis',
        async evaluate({ recentLogs }) {
            const types = new Set(recentLogs.map(l => l.eventType));
            const attackTypes = ['ATTACK_SIM_SQLI', 'ATTACK_SIM_XSS', 'ATTACK_SIM_BRUTE_FORCE', 'HONEYPOT_TRIGGERED'];
            return attackTypes.filter(t => types.has(t)).length >= 2;
        },
    },
    {
        id: 'SUSPICIOUS_HOUR',
        label: 'Activity during unusual hours (2am–5am)',
        weight: 10,
        factor: 'Behavioral Analysis',
        async evaluate() {
            const hour = new Date().getHours();
            return hour >= 2 && hour < 5;
        },
    },
    {
        id: 'ENDPOINT_SCANNING',
        label: 'Accessed many different endpoints in short time (scanning)',
        weight: 15,
        factor: 'IP Reputation',
        async evaluate({ recentLogs }) {
            const endpoints = new Set(recentLogs.map(l => l.endpoint).filter(Boolean));
            return endpoints.size >= 8;
        },
    },
    {
        id: 'REPEATED_AUTH_FAILURE',
        label: 'Account locked or user flagged as blocked',
        weight: 25,
        factor: 'Behavioral Analysis',
        async evaluate({ recentLogs }) {
            return recentLogs.some(l =>
                l.metadata?.userBlocked === true ||
                l.eventType === 'SUSPICIOUS_ACTIVITY'
            );
        },
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Lấy counters từ Redis (nhanh, real-time)
 */
async function getWindowCounts(ip) {
    const now = Date.now();
    const window10m = now - 10 * 60 * 1000;
    const window1h = now - 60 * 60 * 1000;

    const [
        failedLogins10m,
        rateLimitHits,
        totalRequests1h,
    ] = await Promise.all([
        redis.get(`failed_login:${ip}`).catch(() => '0').then(v => parseInt(v || '0')),
        redis.get(`rate_limit_hit:${ip}`).catch(() => '0').then(v => parseInt(v || '0')),
        redis.get(`req_count:${ip}`).catch(() => '0').then(v => parseInt(v || '0')),
    ]);

    return { failedLogins10m, rateLimitHits, totalRequests1h };
}

/**
 * Lấy logs gần đây từ MongoDB (depth analysis)
 */
async function getRecentLogs(ip, limitMinutes = 30) {
    const since = new Date(Date.now() - limitMinutes * 60 * 1000);
    return ActivityLog.find({
        ipAddress: ip,
        createdAt: { $gte: since },
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
}

// ─── Score level mapping ──────────────────────────────────────────────────────

function scoreToLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 35) return 'medium';
    if (score >= 15) return 'low';
    return 'safe';
}

const LEVEL_META = {
    critical: { label: 'CRITICAL', color: '#ef4444', emoji: '🔴' },
    high: { label: 'HIGH', color: '#f97316', emoji: '🟠' },
    medium: { label: 'MEDIUM', color: '#eab308', emoji: '🟡' },
    low: { label: 'LOW', color: '#3b82f6', emoji: '🔵' },
    safe: { label: 'SAFE', color: '#22c55e', emoji: '🟢' },
};

// ─── Main scorer ─────────────────────────────────────────────────────────────

/**
 * Tính risk score cho một IP
 * @param {string} ip
 * @returns {{ score, level, levelMeta, reasons, signals, evaluatedAt }}
 */
async function calculateRiskScore(ip) {
    const [windowCounts, recentLogs] = await Promise.all([
        getWindowCounts(ip),
        getRecentLogs(ip),
    ]);

    const context = { ip, windowCounts, recentLogs };

    // Chạy tất cả rules song song
    const results = await Promise.all(
        RULES.map(async (rule) => {
            try {
                const triggered = await rule.evaluate(context);
                return { rule, triggered };
            } catch (err) {
                console.error(`Rule ${rule.id} error:`, err.message);
                return { rule, triggered: false };
            }
        })
    );

    // Tổng hợp
    const triggeredRules = results.filter(r => r.triggered);
    let rawScore = triggeredRules.reduce((sum, r) => sum + r.rule.weight, 0);

    const breakdownMap = {
        'IP Reputation': { score: 0, maxScore: 30, detail: [] },
        'SQLi Payload': { score: 0, maxScore: 40, detail: [] },
        'Request Velocity': { score: 0, maxScore: 20, detail: [] },
        'Device Fingerprint': { score: 0, maxScore: 10, detail: [] },
        'XSS Payload': { score: 0, maxScore: 40, detail: [] },
        'Behavioral Analysis': { score: 0, maxScore: 20, detail: [] },
    };

    triggeredRules.forEach(r => {
        const factor = r.rule.factor;
        if (breakdownMap[factor]) {
            breakdownMap[factor].score += r.rule.weight;
            breakdownMap[factor].detail.push(r.rule.label);
        }
    });

    // Check device fingerprinting (mocked)
    const isHeadless = context.recentLogs.some(l => l.userAgent && (l.userAgent.includes('Headless') || l.userAgent.includes('python')));
    if (isHeadless) {
        breakdownMap['Device Fingerprint'].score += 10;
        breakdownMap['Device Fingerprint'].detail.push('Headless browser / script detected');
        rawScore += 10;
    }

    const breakdown = Object.keys(breakdownMap)
        .map(factor => {
            const data = breakdownMap[factor];
            const cappedScore = Math.min(data.score, data.maxScore);
            return {
                factor,
                score: cappedScore,
                maxScore: data.maxScore,
                detail: data.detail.length > 0 ? data.detail.join(', ') : 'No anomalies detected'
            };
        });

    const score = Math.min(100, breakdown.reduce((sum, b) => sum + b.score, 0)); // cap tại 100 based on breakdown
    const level = scoreToLevel(score);

    return {
        score,
        level,
        levelMeta: LEVEL_META[level],
        reasons: triggeredRules.map(r => r.rule.label),
        breakdown,
        signals: {
            failedLogins: windowCounts.failedLogins10m,
            rateLimitHits: windowCounts.rateLimitHits,
            recentLogCount: recentLogs.length,
            uniqueEndpoints: new Set(recentLogs.map(l => l.endpoint)).size,
        },
        evaluatedAt: new Date(),
    };
}

/**
 * Tính score cho nhiều IPs cùng lúc (dùng cho dashboard)
 */
async function batchCalculateRiskScore(ips) {
    const results = await Promise.allSettled(
        ips.map(ip => calculateRiskScore(ip).then(r => ({ ip, ...r })))
    );
    return results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .sort((a, b) => b.score - a.score); // sort by risk desc
}

module.exports = { calculateRiskScore, batchCalculateRiskScore, scoreToLevel, LEVEL_META };
