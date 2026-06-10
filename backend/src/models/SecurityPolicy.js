const mongoose = require('mongoose');

const securityPolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ruleId: {
    type: String,
    required: true,
    unique: true,
  },
  condition: {
    metric: {
      type: String,
      enum: ['sqli_risk', 'brute_force_rate', 'total_risk', 'xss_risk', 'reputation_risk', 'velocity_risk'],
      required: true,
    },
    operator: {
      type: String,
      enum: ['>', '>=', '<', '<=', '=='],
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    }
  },
  action: {
    type: String,
    enum: ['block', 'tarpit', 'email_alert', 'log', 'captcha'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium',
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    default: null, // null means global rule
  },
  description: {
    type: String,
  },
  order: {
    type: Number,
    default: 100, // lower executes first
  },
  stats: {
    triggered: { type: Number, default: 0 },
    lastTriggered: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('SecurityPolicy', securityPolicySchema);
