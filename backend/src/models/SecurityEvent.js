const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BRUTE_FORCE', 'SQL_INJECTION', 'HONEYPOT_ACCESS', 'RATE_LIMIT_ABUSE', 'ANOMALY'],
    required: true,
  },
  ipAddress:   { type: String, required: true },
  description: { type: String, required: true },
  severity:    { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  riskScore:   { type: Number, min: 0, max: 100, default: 0 },

  // Evidence linh hoạt: payload SQL, số lần brute force, headers...
  evidence: { type: mongoose.Schema.Types.Mixed, default: {} },

  resolved:   { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('SecurityEvent', securityEventSchema);
