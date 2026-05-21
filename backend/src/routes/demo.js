const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const router = express.Router();

/**
 * POST /api/demo/toggle-security
 * Toggle the global security mode and emit WebSocket event to all clients
 * Body: { enabled: boolean }
 */
router.post('/toggle-security', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ error: 'enabled must be a boolean' });
        }

        // Update global security status
        global.IS_SECURITY_ENABLED = enabled;

        // Get io instance from app
        const io = req.app.get('io');

        // Emit WebSocket event to all connected clients
        io?.emit('security_status_changed', {
            enabled,
            timestamp: new Date(),
            changedBy: req.user?.email || 'unknown',
        });

        // Log the change
        const message = enabled
            ? '🔒 Security enabled'
            : '🔓 Security disabled - Demo mode active';
        console.log(message);

        return res.json({
            success: true,
            securityEnabled: enabled,
            message,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Toggle security error:', error);
        return res.status(500).json({ error: 'Failed to toggle security' });
    }
});

/**
 * POST /api/demo/reset
 * Reset the current test user's wallet to initial state (10 million balance, clear transactions)
 * Emits wallet_update via WebSocket
 */
router.post('/reset', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User ID not found in token' });
        }

        // Find the test user's wallet
        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found for user' });
        }

        // Reset to initial state: 10 million balance, no transactions
        const originalBalance = wallet.balance;
        wallet.balance = 10000000;
        wallet.transactions = [];

        await wallet.save();

        // Get io instance from app
        const io = req.app.get('io');

        // Emit WebSocket event to all connected clients
        io?.emit('wallet_update', {
            userId,
            wallet,
            type: 'reset',
            metadata: {
                previousBalance: originalBalance,
                newBalance: wallet.balance,
                transactionsCleared: true,
            },
        });

        console.log(`🔄 Wallet reset for user ${userId}: ${originalBalance} → ${wallet.balance}`);

        return res.json({
            success: true,
            wallet,
            message: 'Wallet reset to initial state',
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Reset wallet error:', error);
        return res.status(500).json({ error: 'Failed to reset wallet' });
    }
});

/**
 * POST /api/demo/reset-public
 * Reset all wallets to 10,000,000đ — no auth required (demo only)
 * Also resets Redis security mode to unprotected
 */
router.post('/reset-public', async (req, res) => {
    try {
        const redis = require('../config/redis');
        const Wallet = require('../models/Wallet');

        // Reset all wallets
        const wallets = await Wallet.find({});
        for (const wallet of wallets) {
            wallet.balance = 10000000;
            wallet.transactions = [];
            await wallet.save();
        }

        // Reset security mode to unprotected
        await redis.set('payguard:security_mode', 'unprotected');
        global.IS_SECURITY_ENABLED = false;

        // Notify all clients
        const io = req.app.get('io');
        io?.emit('wallet_update', { type: 'reset', newBalance: 10000000 });
        io?.emit('security_status_changed', { enabled: false, timestamp: new Date() });

        console.log(`🔄 [DEMO] All wallets reset to 10,000,000đ, security disabled`);
        return res.json({ success: true, message: 'Demo reset complete', walletsReset: wallets.length });
    } catch (error) {
        console.error('reset-public error:', error);
        return res.status(500).json({ error: 'Reset failed' });
    }
});

module.exports = router;
