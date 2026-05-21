const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
      'REGISTER', 'PASSWORD_CHANGE',
      'RATE_LIMIT_HIT', 'IP_BLOCKED', 'IP_UNBLOCKED',
      'HONEYPOT_TRIGGERED',
      'TWO_FACTOR_ENABLED', 'TWO_FACTOR_DISABLED', 'TWO_FACTOR_FAILED',
      'ATTACK_SIM_BRUTE_FORCE', 'ATTACK_SIM_SQLI', 'ATTACK_SIM_XSS', 'ATTACK_SIM_HONEYPOT',
      'SUSPICIOUS_ACTIVITY', 'ANOMALY_DETECTED',
      'TRANSFER_UNPROTECTED',
    ],
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, default: '' },
  endpoint: { type: String, default: '' },
  method: { type: String, default: '' },

  // Payload linh hoạt theo từng loại event — lợi thế của MongoDB (có thể chứa country/city/region/ll cho GeoIP)
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

  // AI risk score tại thời điểm event xảy ra
  riskScore: { type: Number, min: 0, max: 100, default: 0 },
  riskReasons: [{ type: String }],

  severity: {
    type: String,
    enum: ['info', 'low', 'medium', 'high', 'critical'],
    default: 'info',
  },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
