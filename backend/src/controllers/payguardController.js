const Wallet = require('../models/Wallet');
const User = require('../models/User');
const redis = require('../config/redis');
const { createLog } = require('../services/logService');
const { calculateRiskScore } = require('../services/riskScorer');

const SECURITY_MODE_KEY = 'payguard:security_mode';
const DEFAULT_SECURITY_MODE = String(process.env.PAYGUARD_SECURITY_MODE || 'unprotected').toLowerCase();
const DISABLED_MODES = new Set(['off', 'open', 'unprotected', 'false', '0', 'disabled']);

const DEFAULT_CATEGORIES = [
    { name: 'Ăn uống', budget: 3000000, spent: 1200000, color: '#ff7a1a', icon: '🍜' },
    { name: 'Di chuyển', budget: 1000000, spent: 450000, color: '#00d4ff', icon: '🚗' },
    { name: 'Mua sắm', budget: 2000000, spent: 800000, color: '#9b59b6', icon: '🛍' },
    { name: 'Giải trí', budget: 500000, spent: 200000, color: '#00ff88', icon: '🎮' },
    { name: 'Hóa đơn', budget: 1500000, spent: 1500000, color: '#ff3d5a', icon: '💡' },
    { name: 'Tiết kiệm', budget: 2000000, spent: 500000, color: '#ffb300', icon: '💰' },
];

const COMPROMISED_KEY = 'payguard:compromised';

function normalizeIp(ipAddress) {
    return String(ipAddress || '').replace('::ffff:', '');
}

function getWalletIo(req) {
    return req.app.get('io');
}

function normalizeSecurityMode(mode) {
    return DISABLED_MODES.has(String(mode || '').toLowerCase()) ? 'unprotected' : 'protected';
}

async function getSecurityMode() {
    const storedMode = await redis.get(SECURITY_MODE_KEY).catch(() => null);

    if (storedMode) {
        return normalizeSecurityMode(storedMode);
    }

    const fallbackMode = normalizeSecurityMode(DEFAULT_SECURITY_MODE);
    await redis.set(SECURITY_MODE_KEY, fallbackMode).catch(() => null);
    return fallbackMode;
}

async function setSecurityMode(mode) {
    const normalizedMode = normalizeSecurityMode(mode);
    await redis.set(SECURITY_MODE_KEY, normalizedMode).catch(() => null);
    return normalizedMode;
}

async function simulateCompromise(io) {
    try {
        const already = await redis.get(COMPROMISED_KEY).catch(() => null);
        if (already) return; // run only once while flag present

        const wallets = await Wallet.find({});
        if (!wallets || wallets.length === 0) {
            await redis.set(COMPROMISED_KEY, JSON.stringify({ scenario: 'none', ts: Date.now() })).catch(() => null);
            return;
        }

        const scenario = Math.floor(Math.random() * 5) + 1;

        for (const wallet of wallets) {
            const originalBalance = wallet.balance || 0;

            switch (scenario) {
                case 1:
                    // Full drain to zero
                    if (originalBalance > 0) {
                        wallet.transactions.push({
                            type: 'exploit',
                            amount: originalBalance,
                            description: 'Malicious withdrawal',
                            status: 'success',
                            ipAddress: 'attacker',
                            metadata: { attackerAccount: 'ATTACKER-0001' },
                        });
                        wallet.balance = 0;
                    }
                    break;
                case 2:
                    // Partial drain via unauthorized transfers
                    if (originalBalance > 0) {
                        const steal = Math.min(originalBalance, Math.floor(originalBalance * (0.5 + Math.random() * 0.5)));
                        wallet.balance -= steal;
                        wallet.transactions.push({
                            type: 'transfer',
                            amount: steal,
                            description: 'Unauthorized transfer to attacker',
                            fromAccount: wallet.accountNumber,
                            toAccount: 'ATTACKER-TRANSFER',
                            status: 'success',
                            ipAddress: 'attacker',
                            metadata: { stolen: true },
                        });
                    }
                    break;
                case 3:
                    // Corrupt categories / budgets
                    wallet.categories = (wallet.categories || DEFAULT_CATEGORIES).map(c => ({
                        name: `Compromised - ${c.name}`,
                        budget: 0,
                        spent: c.budget || 0,
                        color: c.color || '#000000',
                        icon: c.icon || '⚠️',
                    }));
                    wallet.transactions.push({
                        type: 'data_tamper',
                        amount: 0,
                        description: 'Categories corrupted by attacker',
                        status: 'success',
                        ipAddress: 'attacker',
                    });
                    break;
                case 4:
                    // Change account identifiers and inject fake history
                    wallet.accountNumber = `ATTACKER-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
                    if (originalBalance > 0) {
                        wallet.transactions.push({
                            type: 'purchase',
                            amount: originalBalance,
                            description: 'Fake merchant charge',
                            status: 'success',
                            ipAddress: 'attacker',
                        });
                        wallet.balance = 0;
                    }
                    break;
                case 5:
                    // Wipe transactions and randomize balance (show inconsistency)
                    wallet.transactions = [{ type: 'wipe', amount: 0, description: 'Transaction history wiped', status: 'success', ipAddress: 'attacker' }];
                    wallet.balance = Math.random() > 0.5 ? 0 : Math.floor(originalBalance / 2);
                    break;
                default:
                    break;
            }

            try {
                await wallet.save();
            } catch (e) {
                console.error('Failed saving compromised wallet for user', wallet.userId, e);
            }

            io?.emit('wallet_compromised', { userId: wallet.userId, walletId: wallet._id, scenario });
            io?.emit('wallet_update', { userId: wallet.userId, wallet, type: 'compromise' });
        }

        await redis.set(COMPROMISED_KEY, JSON.stringify({ scenario, ts: Date.now() })).catch(() => null);

        await createLog({
            eventType: 'SYSTEM_COMPROMISED',
            ipAddress: '0.0.0.0',
            severity: 'critical',
            metadata: { scenario, affected: wallets.length },
        }, io);
    } catch (err) {
        console.error('simulateCompromise error:', err);
    }
}

async function getSecurityStatus() {
    const securityMode = await getSecurityMode();
    return {
        securityMode,
        securityEnabled: securityMode === 'protected',
    };
}

async function ensureWallet(userId) {
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        wallet = await Wallet.create({
            userId,
            categories: DEFAULT_CATEGORIES,
        });
    }

    return wallet;
}

async function getWallet(req, res) {
    try {
        const userId = req.user?.userId;
        const wallet = await ensureWallet(userId);
        return res.json({ wallet });
    } catch (error) {
        console.error('PayGuard getWallet error:', error);
        return res.status(500).json({ error: 'Failed to fetch wallet' });
    }
}

async function getStatus(req, res) {
    return res.json(await getSecurityStatus());
}

async function updateStatus(req, res) {
    try {
        const nextEnabled = req.body?.securityEnabled;
        const requestedMode = nextEnabled === false ? 'unprotected' : 'protected';
        const securityMode = await setSecurityMode(requestedMode);


        return res.json({
            securityMode,
            securityEnabled: securityMode === 'protected',
        });
    } catch (error) {
        console.error('PayGuard updateStatus error:', error);
        return res.status(500).json({ error: 'Failed to update security mode' });
    }
}

async function deposit(req, res) {
    try {
        const userId = req.user?.userId;
        const amount = Number(req.body.amount);
        const description = req.body.description || 'Wallet deposit';
        const metadata = req.body.metadata || {};
        const ipAddress = normalizeIp(req.ip);

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }
        if (amount > 50000000) {
            return res.status(400).json({ error: 'Exceeds single deposit limit' });
        }

        const wallet = await ensureWallet(userId);
        wallet.balance += amount;
        wallet.transactions.push({
            type: 'deposit',
            amount,
            description,
            status: 'success',
            ipAddress,
            metadata,
        });

        await wallet.save();

        await createLog({
            eventType: 'LOGIN_SUCCESS',
            ipAddress,
            userId,
            endpoint: '/api/payguard/deposit',
            method: 'POST',
            severity: 'info',
            metadata: { type: 'deposit', amount },
        }, getWalletIo(req));

        getWalletIo(req)?.emit('wallet_update', {
            userId,
            wallet,
            type: 'deposit',
        });

        return res.json({ success: true, newBalance: wallet.balance, transaction: wallet.transactions.slice(-1)[0] });
    } catch (error) {
        console.error('PayGuard deposit error:', error);
        return res.status(500).json({ error: 'Deposit failed' });
    }
}

async function transfer(req, res) {
    try {
        const userId = req.user?.userId;
        const amount = Number(req.body.amount);
        const toAccount = req.body.toAccount;
        const description = req.body.description || 'Wallet transfer';
        const metadata = req.body.metadata || {};
        const ipAddress = normalizeIp(req.ip);
        const io = getWalletIo(req);

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        if (!toAccount) {
            return res.status(400).json({ error: 'Destination account is required' });
        }

        // ============================================
        // VULNERABLE MODE: Security Disabled
        // ============================================
        if (!global.IS_SECURITY_ENABLED) {
            const senderWallet = await ensureWallet(userId);
            const actualDeduction = Math.min(amount, senderWallet.balance);

            // Skip all security checks - directly deduct balance
            senderWallet.balance = Math.max(0, senderWallet.balance - actualDeduction);
            senderWallet.transactions.push({
                type: 'transfer',
                amount: actualDeduction,
                description,
                fromAccount: senderWallet.accountNumber,
                toAccount,
                status: 'success',
                ipAddress,
                metadata: { ...metadata, mode: 'vulnerable' },
            });

            await senderWallet.save();

            // Emit wallet_update immediately for real-time visualization
            io?.emit('wallet_update', {
                userId,
                wallet: senderWallet,
                type: 'transfer',
                amount,
                newBalance: senderWallet.balance,
                mode: 'vulnerable',
            });

            return res.json({
                success: true,
                type: 'transfer',
                newBalance: senderWallet.balance,
                riskScore: 0,
                mode: 'vulnerable',
            });
        }

        // ============================================
        // SECURE MODE: Security Enabled
        // ============================================
        const blocked = await redis.get(`blocked_ip:${ipAddress}`).catch(() => null);
        const risk = await calculateRiskScore(ipAddress);

        await createLog({
            eventType: 'TRANSFER_ATTEMPT',
            ipAddress,
            userId,
            endpoint: '/api/payguard/transfer',
            method: 'POST',
            severity: risk.score >= 60 ? 'high' : 'medium',
            metadata: { type: 'transfer_attempt', amount, toAccount, riskScore: risk.score },
        }, io);

        io?.emit('transfer_attempt', {
            ip: ipAddress,
            amount,
            toAccount,
            score: risk.score,
            level: risk.level,
            blocked: Boolean(blocked) || risk.score >= 80,
            securityEnabled: true,
            timestamp: new Date(),
        });

        // Check if transfer is blocked
        if (blocked || risk.score >= 80) {
            // Emit 'attack_blocked' event for dashboard visualization
            io?.emit('attack_blocked', {
                ip: ipAddress,
                type: 'transfer',
                score: risk.score,
                blocked: true,
                timestamp: new Date(),
                reasons: risk.reasons,
            });

            await createLog({
                eventType: 'IP_BLOCKED',
                ipAddress,
                severity: 'critical',
                metadata: { reason: 'High risk transfer blocked', score: risk.score, reasons: risk.reasons },
            }, io);

            return res.status(429).json({
                error: 'Transaction blocked by security system',
                reason: 'Suspicious activity detected',
                riskScore: risk.score,
                reasons: risk.reasons,
                retryAfter: 300,
            });
        }

        // Implement tarpit delay for medium risk (40-79)
        const TARPIT_THRESHOLD = 40;
        const BLOCK_THRESHOLD = 80;
        if (risk.score >= TARPIT_THRESHOLD && risk.score < BLOCK_THRESHOLD) {
            const ratio = (risk.score - TARPIT_THRESHOLD) / (BLOCK_THRESHOLD - TARPIT_THRESHOLD);
            const delayMs = Math.floor(3000 + ratio * (30000 - 3000)); // 3-30 seconds

            io?.emit('tarpit_active', {
                ipAddress,
                riskScore: risk.score,
                delayMs,
                endpoint: '/api/payguard/transfer',
                timestamp: new Date(),
            });

            // Notify frontend that this transfer attempt is being tarpitted
            io?.emit('transfer_attempt', {
                ip: ipAddress,
                amount,
                toAccount,
                score: risk.score,
                level: risk.level,
                blocked: false,
                securityEnabled: true,
                tarpitDelay: delayMs,
                status: 'tarpit',
                timestamp: new Date(),
            });

            console.log(`🕸 TARPIT: ${ipAddress} (score:${risk.score}) → delayed ${delayMs}ms`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        const senderWallet = await ensureWallet(userId);
        if (senderWallet.balance < amount) {
            senderWallet.transactions.push({
                type: 'transfer',
                amount,
                description,
                fromAccount: senderWallet.accountNumber,
                toAccount,
                status: 'failed',
                ipAddress,
                metadata: {
                    ...metadata,
                    reason: 'insufficient_balance',
                },
            });

            await senderWallet.save();

            return res.status(400).json({ error: 'Insufficient balance' });
        }

        senderWallet.balance -= amount;
        senderWallet.transactions.push({
            type: 'transfer',
            amount,
            description,
            fromAccount: senderWallet.accountNumber,
            toAccount,
            status: 'success',
            ipAddress,
            metadata: {
                ...metadata,
                riskScore: risk.score,
                mode: 'secure',
            },
        });

        await senderWallet.save();

        io?.emit('wallet_update', {
            userId,
            wallet: senderWallet,
            type: 'transfer',
            amount,
            newBalance: senderWallet.balance,
            mode: 'secure',
        });

        return res.json({
            success: true,
            type: 'transfer',
            newBalance: senderWallet.balance,
            riskScore: risk.score,
            mode: 'secure',
        });
    } catch (error) {
        console.error('PayGuard transfer error:', error);
        return res.status(500).json({ error: 'Transfer failed' });
    }
}

async function withdraw(req, res) {
    try {
        const userId = req.user?.userId;
        const amount = Number(req.body.amount);
        const description = req.body.description || 'Wallet withdrawal';
        const metadata = req.body.metadata || {};
        const ipAddress = normalizeIp(req.ip);
        const wallet = await ensureWallet(userId);

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        if (wallet.balance < amount) {
            wallet.transactions.push({
                type: 'withdraw',
                amount,
                description,
                status: 'failed',
                ipAddress,
                metadata: {
                    ...metadata,
                    reason: 'insufficient_balance',
                },
            });

            await wallet.save();

            return res.status(400).json({ error: 'Insufficient balance' });
        }

        wallet.balance -= amount;
        wallet.transactions.push({
            type: 'withdraw',
            amount,
            description,
            status: 'success',
            ipAddress,
            metadata,
        });

        await wallet.save();

        return res.json({ success: true, newBalance: wallet.balance });
    } catch (error) {
        console.error('PayGuard withdraw error:', error);
        return res.status(500).json({ error: 'Withdrawal failed' });
    }
}

async function updateCategory(req, res) {
    try {
        const userId = req.user?.userId;
        const { name, budget, spent, color, icon } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const wallet = await ensureWallet(userId);
        const categoryIndex = wallet.categories.findIndex(category => category.name === name);
        const categoryPayload = {
            name,
            budget: budget ?? 0,
            spent: spent ?? 0,
            color: color ?? '',
            icon: icon ?? '',
        };

        if (categoryIndex >= 0) {
            wallet.categories[categoryIndex] = {
                ...(wallet.categories[categoryIndex].toObject ? wallet.categories[categoryIndex].toObject() : wallet.categories[categoryIndex]),
                ...categoryPayload,
            };
        } else {
            wallet.categories.push(categoryPayload);
        }

        await wallet.save();

        return res.json({ success: true, categories: wallet.categories });
    } catch (error) {
        console.error('PayGuard updateCategory error:', error);
        return res.status(500).json({ error: 'Failed to update category' });
    }
}

async function getTransactions(req, res) {
    try {
        const userId = req.user?.userId;
        const wallet = await ensureWallet(userId);
        const transactions = [...wallet.transactions].slice(-20).reverse();

        return res.json({ transactions });
    } catch (error) {
        console.error('PayGuard getTransactions error:', error);
        return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
}

module.exports = {
    getWallet,
    getStatus,
    updateStatus,
    deposit,
    transfer,
    withdraw,
    updateCategory,
    getTransactions,
};