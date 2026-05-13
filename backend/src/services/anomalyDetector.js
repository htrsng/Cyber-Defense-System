/**
 * Anomaly Detection Service
 * Phát hiện hành vi bất thường dựa trên pattern so sánh với baseline
 * Chạy định kỳ (hoặc trigger sau mỗi event) để tự động tạo SecurityEvent
 */

const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');
const { calculateRiskScore } = require('./riskScorer');

// ─── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLDS = {
    BRUTE_FORCE_WINDOW_MS: 10 * 60 * 1000,  // 10 phút
    BRUTE_FORCE_MIN_ATTEMPTS: 5,
    SCANNING_WINDOW_MS: 5 * 60 * 1000,  // 5 phút
    SCANNING_MIN_ENDPOINTS: 8,
    AUTO_BLOCK_SCORE: 80,              // Score >= 80 → tự động block IP
};

// ─── Analyzers ────────────────────────────────────────────────────────────────

/**
 * Phát hiện brute force: nhiều LOGIN_FAILED từ cùng IP trong cửa sổ thời gian
 */
async function detectBruteForce(io) {
    const since = new Date(Date.now() - THRESHOLDS.BRUTE_FORCE_WINDOW_MS);

    const pipeline = [
        { $match: { eventType: 'LOGIN_FAILED', createdAt: { $gte: since } } },
        { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
        { $match: { count: { $gte: THRESHOLDS.BRUTE_FORCE_MIN_ATTEMPTS } } },
    ];

    const suspects = await ActivityLog.aggregate(pipeline);

    for (const { _id: ip, count } of suspects) {
        // Kiểm tra đã có event chưa được resolve chưa (tránh tạo trùng)
        const existing = await SecurityEvent.findOne({
            type: 'BRUTE_FORCE',
            ipAddress: ip,
            resolved: false,
            createdAt: { $gte: since },
        });
        if (existing) continue;

        const { score, reasons } = await calculateRiskScore(ip);

        const event = await SecurityEvent.create({
            type: 'BRUTE_FORCE',
            ipAddress: ip,
            description: `Brute force detected: ${count} failed login attempts in 10 minutes`,
            severity: count >= 10 ? 'critical' : 'high',
            riskScore: score,
            evidence: { failedAttempts: count, windowMinutes: 10, reasons },
        });

        // Ghi anomaly log
        await ActivityLog.create({
            eventType: 'ANOMALY_DETECTED',
            ipAddress: ip,
            endpoint: '/api/auth/login',
            riskScore: score,
            riskReasons: reasons,
            severity: count >= 10 ? 'critical' : 'high',
            metadata: { detectedBy: 'anomaly_detector', type: 'BRUTE_FORCE', count },
        });

        // Real-time alert
        io?.emit('security_alert', {
            type: 'BRUTE_FORCE_DETECTED',
            ipAddress: ip,
            severity: event.severity,
            riskScore: score,
            description: event.description,
            timestamp: new Date(),
        });

        console.warn(`🚨 Brute force detected: ${ip} (${count} attempts, score: ${score})`);
    }
}

/**
 * Phát hiện endpoint scanning: IP truy cập quá nhiều endpoint khác nhau
 */
async function detectEndpointScanning(io) {
    const since = new Date(Date.now() - THRESHOLDS.SCANNING_WINDOW_MS);

    const pipeline = [
        { $match: { createdAt: { $gte: since }, endpoint: { $exists: true, $ne: '' } } },
        { $group: { _id: { ip: '$ipAddress', ep: '$endpoint' } } },
        { $group: { _id: '$_id.ip', uniqueEndpoints: { $sum: 1 } } },
        { $match: { uniqueEndpoints: { $gte: THRESHOLDS.SCANNING_MIN_ENDPOINTS } } },
    ];

    const suspects = await ActivityLog.aggregate(pipeline);

    for (const { _id: ip, uniqueEndpoints } of suspects) {
        const existing = await SecurityEvent.findOne({
            type: 'ANOMALY',
            ipAddress: ip,
            resolved: false,
            createdAt: { $gte: since },
        });
        if (existing) continue;

        const { score, reasons } = await calculateRiskScore(ip);

        await SecurityEvent.create({
            type: 'ANOMALY',
            ipAddress: ip,
            description: `Endpoint scanning: ${uniqueEndpoints} unique endpoints in 5 minutes`,
            severity: 'medium',
            riskScore: score,
            evidence: { uniqueEndpoints, windowMinutes: 5, reasons },
        });

        io?.emit('security_alert', {
            type: 'SCANNING_DETECTED',
            ipAddress: ip,
            severity: 'medium',
            riskScore: score,
            description: `Scanning: ${uniqueEndpoints} endpoints in 5 min`,
            timestamp: new Date(),
        });
    }
}

/**
 * Chạy toàn bộ analyzers — gọi định kỳ hoặc sau event quan trọng
 */
async function runAnomalyDetection(io) {
    try {
        await Promise.all([
            detectBruteForce(io),
            detectEndpointScanning(io),
        ]);
    } catch (err) {
        console.error('Anomaly detection error:', err.message);
    }
}

module.exports = { runAnomalyDetection, detectBruteForce, detectEndpointScanning, THRESHOLDS };
