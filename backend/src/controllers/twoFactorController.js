const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const User = require('../models/User');
const { createLog } = require('../services/logService');

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function signToken(user) {
    return jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function verifyTotp(secret, token) {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
    });
}

async function setup(req, res) {
    try {
        const userId = req.user?.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({ error: '2FA already enabled' });
        }

        const secret = speakeasy.generateSecret({
            name: `CyberDef (${user.email})`,
            length: 20,
        });

        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        user.twoFactorSecret = secret.base32;
        await user.save();

        return res.status(200).json({
            qrCodeUrl,
            secret: secret.base32,
            message: 'Scan QR with Google Authenticator',
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        return res.status(500).json({ error: 'Failed to setup 2FA' });
    }
}

async function verify(req, res) {
    try {
        const { token } = req.body;
        const userId = req.user?.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({ error: 'Setup 2FA first' });
        }

        const verified = verifyTotp(user.twoFactorSecret, token);

        if (!verified) {
            await createLog({
                eventType: 'LOGIN_FAILED',
                ipAddress: req.ip,
                userId: user._id,
                metadata: { reason: '2FA_INVALID' },
                severity: 'medium',
                endpoint: '/api/auth/2fa/verify',
                method: 'POST',
            }, req.app.get('io'));

            await createLog({
                eventType: 'TWO_FACTOR_FAILED',
                ipAddress: req.ip,
                userId: user._id,
                metadata: { reason: '2FA_INVALID' },
                severity: 'medium',
                endpoint: '/api/auth/2fa/verify',
                method: 'POST',
            }, req.app.get('io'));

            return res.status(401).json({ error: 'Invalid OTP' });
        }

        user.twoFactorEnabled = true;
        await user.save();

        await createLog({
            eventType: 'TWO_FACTOR_ENABLED',
            ipAddress: req.ip,
            userId: user._id,
            severity: 'info',
            endpoint: '/api/auth/2fa/verify',
            method: 'POST',
            metadata: { twoFactorEnabled: true },
        }, req.app.get('io'));

        return res.status(200).json({ message: '2FA enabled successfully', enabled: true });
    } catch (error) {
        console.error('2FA verify error:', error);
        return res.status(500).json({ error: 'Failed to verify 2FA' });
    }
}

async function validate(req, res) {
    try {
        const { token, userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const verified = user.twoFactorSecret
            ? verifyTotp(user.twoFactorSecret, token)
            : false;

        if (!verified) {
            await createLog({
                eventType: 'LOGIN_FAILED',
                ipAddress: req.ip,
                userId: user._id,
                metadata: { reason: '2FA_INVALID_LOGIN' },
                severity: 'medium',
                endpoint: '/api/auth/2fa/validate',
                method: 'POST',
            }, req.app.get('io'));

            await createLog({
                eventType: 'TWO_FACTOR_FAILED',
                ipAddress: req.ip,
                userId: user._id,
                metadata: { reason: '2FA_INVALID_LOGIN' },
                severity: 'medium',
                endpoint: '/api/auth/2fa/validate',
                method: 'POST',
            }, req.app.get('io'));

            return res.status(401).json({ error: 'Invalid OTP' });
        }

        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();

        const jwtToken = signToken(user);

        await createLog({
            eventType: 'LOGIN_SUCCESS',
            ipAddress: req.ip,
            userId: user._id,
            endpoint: '/api/auth/2fa/validate',
            method: 'POST',
            severity: 'info',
            metadata: { twoFactorUsed: true },
        }, req.app.get('io'));

        return res.status(200).json({ token: jwtToken, user: user.toSafeObject() });
    } catch (error) {
        console.error('2FA validate error:', error);
        return res.status(500).json({ error: 'Failed to validate 2FA' });
    }
}

async function disable(req, res) {
    try {
        const { token } = req.body;
        const userId = req.user?.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({ error: 'Setup 2FA first' });
        }

        const verified = verifyTotp(user.twoFactorSecret, token);

        if (!verified) {
            await createLog({
                eventType: 'TWO_FACTOR_FAILED',
                ipAddress: req.ip,
                userId: user._id,
                metadata: { reason: '2FA_INVALID_DISABLE' },
                severity: 'medium',
                endpoint: '/api/auth/2fa/disable',
                method: 'POST',
            }, req.app.get('io'));

            return res.status(401).json({ error: 'Invalid OTP' });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await user.save();

        await createLog({
            eventType: 'TWO_FACTOR_DISABLED',
            ipAddress: req.ip,
            userId: user._id,
            severity: 'info',
            endpoint: '/api/auth/2fa/disable',
            method: 'POST',
            metadata: { twoFactorEnabled: false },
        }, req.app.get('io'));

        return res.status(200).json({ message: '2FA disabled', enabled: false });
    } catch (error) {
        console.error('2FA disable error:', error);
        return res.status(500).json({ error: 'Failed to disable 2FA' });
    }
}

async function status(req, res) {
    try {
        const userId = req.user?.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            enabled: user.twoFactorEnabled,
            email: user.email,
        });
    } catch (error) {
        console.error('2FA status error:', error);
        return res.status(500).json({ error: 'Failed to fetch 2FA status' });
    }
}

module.exports = {
    setup,
    verify,
    validate,
    disable,
    status,
};