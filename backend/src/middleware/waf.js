const { createLog } = require('../services/logService');

// Các pattern cơ bản để nhận diện SQL Injection và tool tấn công
const SQLI_PATTERNS = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /(union\s+select|insert\s+into|update\s+|delete\s+from|drop\s+table)/i,
    /sqlmap/i
];

module.exports = async function wafMiddleware(req, res, next) {
    const payloadString = (JSON.stringify(req.body || {}) + " " + JSON.stringify(req.query || {})).toLowerCase();
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const uri = req.originalUrl.toLowerCase();

    let isAttack = false;
    let triggerPattern = '';
    
    for (const pattern of SQLI_PATTERNS) {
        if (pattern.test(payloadString) || pattern.test(userAgent) || pattern.test(uri)) {
            isAttack = true;
            triggerPattern = pattern.toString();
            break;
        }
    }

    if (isAttack) {
        // Ghi log attack để Risk Scorer tính toán (SQLI_ATTEMPT rules)
        await createLog({
            eventType: 'ATTACK_SIM_SQLI',
            ipAddress: req.ip,
            endpoint: req.originalUrl,
            method: req.method,
            userAgent: req.headers['user-agent'],
            severity: 'critical',
            metadata: { payload: payloadString, triggerPattern }
        }, req.app.get('io'));

        // Giả lập Tarpit hoặc block luôn
        console.log(`[WAF BLOCKED] SQLi payload detected from ${req.ip}`);
        
        const io = req.app.get('io');
        if (io) {
            io.emit('attack_blocked', {
                ip: req.ip,
                type: 'sqli',
                score: 95,
                timestamp: new Date()
            });
        }
        
        return res.status(403).json({
            error: 'WAF Blocked',
            message: 'Malicious payload detected and blocked by CyberDef WAF.'
        });
    }

    next();
};
