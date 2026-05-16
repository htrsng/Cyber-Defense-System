const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Loại bỏ password khỏi response
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
