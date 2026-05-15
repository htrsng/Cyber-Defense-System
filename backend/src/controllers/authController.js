const jwt = require('jsonwebtoken');

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

async function register(req, res) {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const user = new User({
            email: email.toLowerCase(),
            password,
            role: role || 'viewer',
        });

        await user.save();

        const token = signToken(user);

        await createLog({
            eventType: 'REGISTER',
            ipAddress: req.ip,
            userId: user._id,
            endpoint: '/api/auth/register',
            method: 'POST',
            severity: 'info',
        }, req.app.get('io'));

        return res.status(201).json({
            message: 'User created',
            token,
            user: user.toSafeObject(),
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            await createLog({
                eventType: 'LOGIN_FAILED',
                ipAddress: req.ip,
                metadata: { reason: 'User not found', email },
                severity: 'medium',
                endpoint: '/api/auth/login',
                method: 'POST',
            }, req.app.get('io'));

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ error: 'Account blocked' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await createLog({
                eventType: 'LOGIN_FAILED',
                ipAddress: req.ip,
                metadata: { email, attempt: true },
                severity: 'medium',
                endpoint: '/api/auth/login',
                method: 'POST',
            }, req.app.get('io'));

            return res.status(401).json({ error: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();

        const token = signToken(user);

        await createLog({
            eventType: 'LOGIN_SUCCESS',
            ipAddress: req.ip,
            userId: user._id,
            endpoint: '/api/auth/login',
            method: 'POST',
            severity: 'info',
        }, req.app.get('io'));

        return res.status(200).json({
            token,
            user: user.toSafeObject(),
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
}

async function logout(req, res) {
    try {
        await createLog({
            eventType: 'LOGOUT',
            ipAddress: req.ip,
            userId: req.user?.userId || null,
            endpoint: '/api/auth/logout',
            method: 'POST',
            severity: 'info',
        }, req.app.get('io'));

        return res.status(200).json({ message: 'Logged out' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Logout failed' });
    }
}

async function me(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ user: user.toSafeObject() });
    } catch (error) {
        console.error('Me error:', error);
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
}

module.exports = {
    register,
    login,
    logout,
    me,
};