const PDFDocument = require('pdfkit');
const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');

const COLORS = {
    bg: '#060a0f',
    panel: '#0d1117',
    card: '#111820',
    cyan: '#00d4ff',
    green: '#00ff88',
    red: '#ff3d5a',
    amber: '#ffb300',
    orange: '#ff7a1a',
    muted: '#5a7a99',
    dim: '#2d4a66',
    text: '#e2eaf4',
};

function severityColor(severity) {
    const map = {
        critical: '#ff3d5a',
        high: '#ff7a1a',
        medium: '#ffb300',
        low: '#00d4ff',
        info: '#5a7a99',
    };

    return map[severity] || '#5a7a99';
}

function riskColor(score) {
    if (score >= 80) return '#ff3d5a';
    if (score >= 60) return '#ff7a1a';
    if (score >= 35) return '#ffb300';
    if (score >= 15) return '#00d4ff';
    return '#00ff88';
}

function drawRect(doc, x, y, w, h, color, filled = true) {
    doc.save();
    if (filled) {
        doc.rect(x, y, w, h).fill(color);
    } else {
        doc.rect(x, y, w, h).stroke(color);
    }
    doc.restore();
}

function drawText(doc, text, x, y, options = {}) {
    doc.save();
    if (options.color) doc.fillColor(options.color);
    if (options.size) doc.fontSize(options.size);
    if (options.font) doc.font(options.font);
    doc.text(text, x, y, options);
    doc.restore();
}

async function generateSecurityReport(rangeHours = 24) {
    const since = new Date(Date.now() - rangeHours * 60 * 60 * 1000);

    const [
        totalEvents,
        criticalEvents,
        highEvents,
        unresolvedThreats,
        topEventTypes,
        recentLogs,
        topIPs,
        securityEvents,
    ] = await Promise.all([
        ActivityLog.countDocuments({ createdAt: { $gte: since } }),
        ActivityLog.countDocuments({ severity: 'critical', createdAt: { $gte: since } }),
        ActivityLog.countDocuments({ severity: 'high', createdAt: { $gte: since } }),
        SecurityEvent.countDocuments({ resolved: false }),
        ActivityLog.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: '$eventType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
        ]),
        ActivityLog.find({ createdAt: { $gte: since } })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
        ActivityLog.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: '$ipAddress', count: { $sum: 1 }, maxRisk: { $max: '$riskScore' } } },
            { $sort: { maxRisk: -1 } },
            { $limit: 8 },
        ]),
        SecurityEvent.find({ createdAt: { $gte: since } })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
    ]);

    const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        info: {
            Title: 'CyberDef Security Report',
            Author: 'CyberDef AI Threat Monitoring',
            Subject: 'Security Analysis Report',
        },
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    const pdfPromise = new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
    });

    drawRect(doc, 0, 0, 595, 842, COLORS.bg);
    drawRect(doc, 0, 0, 595, 80, COLORS.panel);
    doc.moveTo(0, 80).lineTo(595, 80).stroke(COLORS.dim);

    drawText(doc, '◈ CYBERDEF', 40, 22, {
        color: COLORS.cyan,
        size: 22,
        font: 'Helvetica-Bold',
    });
    drawText(doc, 'AI THREAT MONITORING SYSTEM', 40, 48, {
        color: COLORS.muted,
        size: 9,
    });
    drawText(doc, 'SECURITY REPORT', 595 - 200, 20, {
        color: COLORS.text,
        size: 16,
        font: 'Helvetica-Bold',
        width: 160,
        align: 'right',
    });
    drawText(doc, `Generated: ${new Date().toLocaleString('vi-VN')}`, 595 - 200, 42, {
        color: COLORS.muted,
        size: 9,
        width: 160,
        align: 'right',
    });
    drawText(doc, `Period: Last ${rangeHours} hours`, 595 - 200, 56, {
        color: COLORS.muted,
        size: 9,
        width: 160,
        align: 'right',
    });

    let y = 100;
    drawText(doc, 'EXECUTIVE SUMMARY', 40, y, { color: COLORS.muted, size: 9 });
    doc.moveTo(40, y + 14).lineTo(555, y + 14).stroke(COLORS.dim);
    y += 24;

    const tiles = [
        { label: 'TOTAL EVENTS', value: totalEvents, color: COLORS.cyan },
        { label: 'CRITICAL', value: criticalEvents, color: COLORS.red },
        { label: 'HIGH SEVERITY', value: highEvents, color: COLORS.orange },
        { label: 'UNRESOLVED', value: unresolvedThreats, color: COLORS.amber },
    ];

    tiles.forEach((tile, index) => {
        const tx = 40 + index * 130;
        drawRect(doc, tx, y, 122, 64, COLORS.card);
        drawRect(doc, tx, y, 122, 3, tile.color);
        drawText(doc, tile.label, tx + 8, y + 10, { color: COLORS.muted, size: 8 });
        drawText(doc, String(tile.value), tx + 8, y + 24, {
            color: tile.color,
            size: 26,
            font: 'Helvetica-Bold',
        });
    });
    y += 80;

    drawText(doc, 'TOP EVENT TYPES', 40, y, { color: COLORS.muted, size: 9 });
    doc.moveTo(40, y + 14).lineTo(555, y + 14).stroke(COLORS.dim);
    y += 24;

    const maxCount = Math.max(...topEventTypes.map((eventType) => eventType.count), 1);
    topEventTypes.forEach((eventType) => {
        const barWidth = Math.floor((eventType.count / maxCount) * 300);
        drawText(doc, eventType._id.replace(/_/g, ' '), 40, y + 3, {
            color: COLORS.text,
            size: 9,
            width: 180,
        });
        drawRect(doc, 230, y, barWidth, 14, `${COLORS.cyan}44`);
        drawRect(doc, 230, y, barWidth, 14, COLORS.cyan, false);
        drawText(doc, String(eventType.count), 540, y + 3, {
            color: COLORS.cyan,
            size: 9,
            width: 15,
            align: 'right',
        });
        y += 22;
    });
    y += 10;

    drawText(doc, 'TOP RISK IP ADDRESSES', 40, y, { color: COLORS.muted, size: 9 });
    doc.moveTo(40, y + 14).lineTo(555, y + 14).stroke(COLORS.dim);
    y += 24;

    drawRect(doc, 40, y, 515, 18, `${COLORS.dim}44`);
    ['RANK', 'IP ADDRESS', 'REQUESTS', 'MAX RISK SCORE', 'RISK LEVEL'].forEach((header, index) => {
        const xs = [44, 90, 250, 330, 440];
        drawText(doc, header, xs[index], y + 4, { color: COLORS.muted, size: 8 });
    });
    y += 20;

    topIPs.forEach((ip, index) => {
        const rowColor = index % 2 === 0 ? COLORS.card : COLORS.panel;
        drawRect(doc, 40, y, 515, 18, rowColor);
        const rc = riskColor(ip.maxRisk);
        const level = ip.maxRisk >= 80 ? 'CRITICAL' : ip.maxRisk >= 60 ? 'HIGH' : ip.maxRisk >= 35 ? 'MEDIUM' : 'LOW';
        drawText(doc, `#${index + 1}`, 44, y + 4, { color: COLORS.muted, size: 8 });
        drawText(doc, ip._id, 90, y + 4, { color: COLORS.cyan, size: 8 });
        drawText(doc, String(ip.count), 250, y + 4, { color: COLORS.text, size: 8 });
        drawText(doc, String(ip.maxRisk), 340, y + 4, { color: rc, size: 9, font: 'Helvetica-Bold' });
        drawRect(doc, 440, y + 3, 60, 13, `${rc}33`);
        drawText(doc, level, 443, y + 4, { color: rc, size: 8 });
        y += 20;
    });

    doc.addPage();
    drawRect(doc, 0, 0, 595, 842, COLORS.bg);
    drawRect(doc, 0, 0, 595, 40, COLORS.panel);
    drawText(doc, '◈ CYBERDEF — Security Report (continued)', 40, 14, {
        color: COLORS.muted,
        size: 9,
    });
    y = 60;

    drawText(doc, 'SECURITY EVENTS', 40, y, { color: COLORS.muted, size: 9 });
    doc.moveTo(40, y + 14).lineTo(555, y + 14).stroke(COLORS.dim);
    y += 24;

    securityEvents.forEach((event) => {
        const sc = severityColor(event.severity);
        drawRect(doc, 40, y, 4, 36, sc);
        drawRect(doc, 44, y, 511, 36, COLORS.card);
        drawText(doc, event.type?.replace(/_/g, ' ') || 'UNKNOWN', 52, y + 5, {
            color: sc,
            size: 9,
            font: 'Helvetica-Bold',
        });
        drawText(doc, event.description || '', 52, y + 18, {
            color: COLORS.text,
            size: 8,
            width: 350,
        });
        drawText(doc, event.ipAddress, 420, y + 5, { color: COLORS.cyan, size: 8 });
        drawText(doc, `Score: ${event.riskScore}`, 420, y + 18, {
            color: riskColor(event.riskScore),
            size: 8,
        });
        drawText(doc, new Date(event.createdAt).toLocaleString('vi-VN'), 420, y + 28, {
            color: COLORS.muted,
            size: 7,
        });
        y += 44;
        if (y > 760) {
            doc.addPage();
            drawRect(doc, 0, 0, 595, 842, COLORS.bg);
            y = 40;
        }
    });

    y += 10;
    drawText(doc, 'RECENT ACTIVITY LOG', 40, y, { color: COLORS.muted, size: 9 });
    doc.moveTo(40, y + 14).lineTo(555, y + 14).stroke(COLORS.dim);
    y += 24;

    drawRect(doc, 40, y, 515, 16, `${COLORS.dim}44`);
    ['TIME', 'EVENT TYPE', 'IP ADDRESS', 'RISK'].forEach((header, index) => {
        const xs = [44, 130, 320, 480];
        drawText(doc, header, xs[index], y + 3, { color: COLORS.muted, size: 8 });
    });
    y += 18;

    recentLogs.slice(0, 15).forEach((log, index) => {
        if (y > 780) {
            doc.addPage();
            drawRect(doc, 0, 0, 595, 842, COLORS.bg);
            y = 40;
        }
        drawRect(doc, 40, y, 515, 15, index % 2 === 0 ? COLORS.card : COLORS.panel);
        drawText(doc, new Date(log.createdAt).toLocaleTimeString('vi-VN'), 44, y + 3, {
            color: COLORS.muted,
            size: 7,
        });
        drawText(doc, log.eventType?.replace(/_/g, ' ') || '', 130, y + 3, {
            color: COLORS.text,
            size: 7,
            width: 180,
        });
        drawText(doc, log.ipAddress || '', 320, y + 3, {
            color: COLORS.cyan,
            size: 7,
            width: 150,
        });
        drawText(doc, String(log.riskScore || 0), 480, y + 3, {
            color: riskColor(log.riskScore),
            size: 8,
            font: 'Helvetica-Bold',
        });
        y += 16;
    });

    if (y > 680) {
        doc.addPage();
        drawRect(doc, 0, 0, 595, 842, COLORS.bg);
        y = 40;
    }
    y += 16;
    drawText(doc, 'SECURITY RECOMMENDATIONS', 40, y, { color: COLORS.muted, size: 9 });
    doc.moveTo(40, y + 14).lineTo(555, y + 14).stroke(COLORS.dim);
    y += 24;

    const recommendations = [
        { title: 'Enable 2FA for all admin accounts', priority: 'HIGH' },
        { title: 'Review and rotate JWT secrets monthly', priority: 'MEDIUM' },
        { title: 'Add CAPTCHA after 3 failed login attempts', priority: 'HIGH' },
        { title: 'Enable GeoIP blocking for high-risk regions', priority: 'MEDIUM' },
        { title: 'Set up automated daily security reports', priority: 'LOW' },
        { title: 'Monitor and review tarpit logs weekly', priority: 'LOW' },
    ];

    recommendations.forEach((recommendation) => {
        const pc = recommendation.priority === 'HIGH'
            ? COLORS.red
            : recommendation.priority === 'MEDIUM'
                ? COLORS.amber
                : COLORS.cyan;
        drawRect(doc, 40, y, 515, 20, COLORS.card);
        drawRect(doc, 40, y, 3, 20, pc);
        drawText(doc, `[${recommendation.priority}]`, 48, y + 5, {
            color: pc,
            size: 8,
            font: 'Helvetica-Bold',
        });
        drawText(doc, recommendation.title, 100, y + 5, { color: COLORS.text, size: 9 });
        y += 24;
    });

    drawRect(doc, 0, 802, 595, 40, COLORS.panel);
    doc.moveTo(0, 802).lineTo(595, 802).stroke(COLORS.dim);
    drawText(doc, 'CyberDef AI Threat Monitoring System — Confidential Security Report', 40, 814, {
        color: COLORS.muted,
        size: 8,
    });
    drawText(doc, 'Page 2 of 2', 515, 814, {
        color: COLORS.muted,
        size: 8,
        width: 40,
        align: 'right',
    });

    doc.end();

    return pdfPromise;
}

module.exports = { generateSecurityReport };