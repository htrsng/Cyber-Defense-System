/**
 * Email Alert Service
 * Sends automated email alerts for critical security events
 */

const nodemailer = require('nodemailer');
const SecurityEvent = require('../models/SecurityEvent');

// ─── Initialize Transporter ───────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify()
  .then(() => console.log('✅ Email service ready'))
  .catch(e => console.warn('⚠ Email service unavailable:', e.message));

// ─── sendCriticalAlert: Send immediate alert for critical/high severity events ───

async function sendCriticalAlert(event, ipInfo) {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #060a0f; color: #e2eaf4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px; }
    .header { background: #0d1117; border: 1px solid #ff3d5a; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; color: #00d4ff; letter-spacing: 0.1em; }
    .alert-badge { background: #ff3d5a22; border: 1px solid #ff3d5a; border-radius: 4px; padding: 6px 16px; display: inline-block; color: #ff3d5a; font-size: 13px; font-weight: bold; margin-top: 10px; }
    .card { background: #111820; border: 1px solid #1e2d3d; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
    .card-title { font-size: 11px; letter-spacing: 0.1em; color: #5a7a99; text-transform: uppercase; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e2d3d; }
    .row:last-child { border-bottom: none; }
    .label { color: #5a7a99; font-size: 13px; }
    .value { color: #e2eaf4; font-size: 13px; font-weight: bold; }
    .value.red { color: #ff3d5a; }
    .value.amber { color: #ffb300; }
    .value.cyan { color: #00d4ff; }
    .score-bar { background: #1e2d3d; border-radius: 2px; height: 6px; margin-top: 8px; }
    .score-fill { background: #ff3d5a; border-radius: 2px; height: 6px; }
    .recommendations { background: #0d3320; border: 1px solid #00ff8844; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .rec-title { color: #00ff88; font-size: 13px; font-weight: bold; margin-bottom: 8px; }
    .rec-item { color: #e2eaf4; font-size: 13px; padding: 4px 0; }
    .rec-item::before { content: "→ "; color: #00ff88; }
    .footer { text-align: center; color: #2d4a66; font-size: 11px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">◈ CYBERDEF</div>
      <div style="color: #5a7a99; font-size: 11px; letter-spacing: 0.15em; margin-top: 4px;">AI THREAT MONITORING SYSTEM</div>
      <div class="alert-badge">⚠ CRITICAL SECURITY ALERT</div>
    </div>

    <div class="card">
      <div class="card-title">Threat Details</div>
      <div class="row">
        <span class="label">Attack Type</span>
        <span class="value red">${event.type?.replace(/_/g, ' ')}</span>
      </div>
      <div class="row">
        <span class="label">IP Address</span>
        <span class="value cyan">${event.ipAddress}</span>
      </div>
      <div class="row">
        <span class="label">Location</span>
        <span class="value">${ipInfo?.country || 'Unknown'} ${ipInfo?.city ? '— ' + ipInfo.city : ''}</span>
      </div>
      <div class="row">
        <span class="label">Severity</span>
        <span class="value red">${event.severity?.toUpperCase()}</span>
      </div>
      <div class="row">
        <span class="label">Description</span>
        <span class="value">${event.description}</span>
      </div>
      <div class="row">
        <span class="label">Detected At</span>
        <span class="value amber">${new Date(event.createdAt).toLocaleString('vi-VN')}</span>
      </div>
      <div style="margin-top: 12px;">
        <div class="label" style="margin-bottom: 6px;">Risk Score: <strong style="color:#ff3d5a">${event.riskScore}/100</strong></div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${event.riskScore}%;"></div>
        </div>
      </div>
    </div>

    <div class="recommendations">
      <div class="rec-title">⚡ Recommended Actions</div>
      <div class="rec-item">Block IP ${event.ipAddress} immediately</div>
      <div class="rec-item">Review activity logs for this IP</div>
      <div class="rec-item">Check for lateral movement from same subnet</div>
      <div class="rec-item">Update firewall rules if attack persists</div>
    </div>

    <div class="card">
      <div class="card-title">Evidence</div>
      <pre style="color: #5a7a99; font-size: 11px; overflow-x: auto; margin: 0;">${JSON.stringify(event.evidence || {}, null, 2)}</pre>
    </div>

    <div class="footer">
      <p>CyberDef AI Threat Monitoring System</p>
      <p>This is an automated alert. Do not reply to this email.</p>
      <p style="margin-top: 8px;">
        <a href="http://${process.env.FRONTEND_URL || 'localhost:3000'}" style="color: #00d4ff;">Open Dashboard →</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"CyberDef Alert" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `🚨 [CRITICAL] ${event.type?.replace(/_/g, ' ')} detected — IP: ${event.ipAddress}`,
      html,
    });

    console.log(`📧 Critical alert email sent for ${event.ipAddress}`);
  } catch (err) {
    console.error('Failed to send critical alert email:', err.message);
  }
}

// ─── sendDailyReport: Send daily summary email at midnight ───

async function sendDailyReport(stats) {
  try {
    const { totalEvents, criticalEvents, topIPs, unresolvedThreats } = stats;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #060a0f; color: #e2eaf4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px; }
    .header { background: #0d1117; border: 1px solid #00d4ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; color: #00d4ff; letter-spacing: 0.1em; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .stat-card { background: #111820; border: 1px solid #1e2d3d; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #00d4ff; }
    .stat-label { color: #5a7a99; font-size: 11px; text-transform: uppercase; margin-top: 8px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .table th { background: #0d1117; color: #5a7a99; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #1e2d3d; }
    .table td { padding: 10px; border-bottom: 1px solid #1e2d3d; font-size: 12px; }
    .table tr:last-child td { border-bottom: none; }
    .footer { text-align: center; color: #2d4a66; font-size: 11px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">◈ CYBERDEF</div>
      <div style="color: #5a7a99; font-size: 11px; letter-spacing: 0.15em; margin-top: 4px;">DAILY THREAT REPORT</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${totalEvents}</div>
        <div class="stat-label">Total Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #ff3d5a;">${criticalEvents}</div>
        <div class="stat-label">Critical Events</div>
      </div>
    </div>

    <div style="background: #111820; border: 1px solid #1e2d3d; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <div style="color: #5a7a99; font-size: 11px; text-transform: uppercase; margin-bottom: 12px;">Top Threat IPs</div>
      <table class="table">
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Events</th>
          </tr>
        </thead>
        <tbody>
          ${(topIPs || []).map(ip => `
            <tr>
              <td style="color: #00d4ff;">${ip.ipAddress}</td>
              <td>${ip.count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="background: #111820; border: 1px solid #1e2d3d; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <div style="color: #5a7a99; font-size: 11px; text-transform: uppercase; margin-bottom: 12px;">Unresolved Threats: ${unresolvedThreats}</div>
    </div>

    <div class="footer">
      <p>CyberDef AI Threat Monitoring System</p>
      <p>This is an automated report. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"CyberDef Report" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `📊 CyberDef Daily Report — ${new Date().toLocaleDateString('vi-VN')}`,
      html,
    });

    console.log('📧 Daily report email sent');
  } catch (err) {
    console.error('Failed to send daily report email:', err.message);
  }
}

// ─── testEmail: Send test email to verify configuration ───

async function testEmail() {
  try {
    await transporter.sendMail({
      from: `"CyberDef Test" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: '✅ CyberDef Email Service Test',
      html: `
        <h2>Email Service Test</h2>
        <p>CyberDef email service is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <p>You will receive alerts at this email address when critical security events are detected.</p>
      `,
    });

    console.log('📧 Test email sent successfully');
    return { success: true, message: 'Test email sent successfully' };
  } catch (err) {
    console.error('Failed to send test email:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendCriticalAlert, sendDailyReport, testEmail };
