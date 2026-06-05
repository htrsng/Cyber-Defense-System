const mongoose = require('mongoose');
const crypto = require('crypto');

const websiteSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },
  dailyRequestCount: {
    type: Number,
    default: 0,
  },
  dailyRequestLimit: {
    type: Number,
    default: 1000, // Free plan: 1000 req/day
  },
  lastResetDate: {
    type: String, // YYYY-MM-DD format for daily reset tracking
    default: () => new Date().toISOString().split('T')[0],
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active',
  },
  // Stats
  totalEventsBlocked: { type: Number, default: 0 },
  totalEventsLogged: { type: Number, default: 0 },
}, { timestamps: true });

/**
 * Generate a unique CyberDef API key
 * Format: cdf_live_<32 hex chars>
 */
websiteSchema.statics.generateApiKey = function () {
  return `cdf_live_${crypto.randomBytes(16).toString('hex')}`;
};

/**
 * Get daily request limit based on plan
 */
websiteSchema.statics.getPlanLimit = function (plan) {
  const limits = {
    free: 1000,
    pro: 50000,
    enterprise: 500000,
  };
  return limits[plan] || limits.free;
};

/**
 * Check and reset daily counter if new day
 */
websiteSchema.methods.checkDailyReset = function () {
  const today = new Date().toISOString().split('T')[0];
  if (this.lastResetDate !== today) {
    this.dailyRequestCount = 0;
    this.lastResetDate = today;
    return true; // was reset
  }
  return false;
};

/**
 * Increment daily request count, returns false if limit exceeded
 */
websiteSchema.methods.incrementRequest = async function () {
  this.checkDailyReset();
  if (this.dailyRequestCount >= this.dailyRequestLimit) {
    return false; // Rate limit exceeded
  }
  this.dailyRequestCount += 1;
  this.totalEventsLogged += 1;
  await this.save();
  return true;
};

module.exports = mongoose.model('Website', websiteSchema);
