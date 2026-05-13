const ActivityLog   = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');

module.exports = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const io        = req.app.get('io');

  try {
    // Ghi log honeypot
    await ActivityLog.create({
      eventType:   'HONEYPOT_TRIGGERED',
      ipAddress,
      userAgent:   req.headers['user-agent'] || '',
      endpoint:    req.path,
      method:      req.method,
      riskScore:   95,
      riskReasons: [
        'Accessed known honeypot endpoint',
        'Possible attacker reconnaissance',
        `Path: ${req.path}`,
      ],
      severity: 'critical',
      metadata: {
        headers: req.headers,
        query:   req.query,
        body:    req.body,
      },
    });

    // Tạo security event
    await SecurityEvent.create({
      type:        'HONEYPOT_ACCESS',
      ipAddress,
      description: `Honeypot triggered: ${req.method} ${req.path}`,
      severity:    'critical',
      riskScore:   95,
      evidence:    {
        endpoint:  req.path,
        userAgent: req.headers['user-agent'],
        method:    req.method,
      },
    });

    // Push real-time tới dashboard
    io?.emit('security_alert', {
      type:      'HONEYPOT_TRIGGERED',
      ipAddress,
      endpoint:  req.path,
      severity:  'critical',
      riskScore: 95,
      timestamp: new Date(),
    });

    console.warn(`🍯 HONEYPOT: ${ipAddress} → ${req.method} ${req.path}`);
  } catch (err) {
    console.error('Honeypot log error:', err.message);
  }

  // Trả 404 giả — không lộ đây là trap
  res.status(404).json({ message: 'Not found' });
};
