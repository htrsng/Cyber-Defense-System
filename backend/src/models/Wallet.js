const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['deposit', 'withdraw', 'transfer', 'otp_attempt', 'exploit', 'data_tamper', 'purchase', 'wipe'], required: true },
    amount: { type: Number, default: 0 },
    description: { type: String, default: '' },
    fromAccount: { type: String, default: '' },
    toAccount: { type: String, default: '' },
    status: { type: String, enum: ['success', 'failed', 'blocked'], default: 'success' },
    ipAddress: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, default: 5000000000 },
    accountNumber: { type: String, unique: true },
    bankLinked: { type: Boolean, default: true },
    bankName: { type: String, default: 'Vietcombank' },
    bankAccount: { type: String, default: '****3456' },
    categories: [{
        name: { type: String },
        budget: { type: Number },
        spent: { type: Number, default: 0 },
        color: { type: String },
        icon: { type: String },
    }],
    transactions: [transactionSchema],
}, { timestamps: true });

walletSchema.pre('save', function (next) {
    if (!this.accountNumber) {
        this.accountNumber = 'PAY-' + Date.now().toString().slice(-8);
    }
    next();
});

module.exports = mongoose.model('Wallet', walletSchema);
