require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:secret123@localhost:27017/cyberdefense?authSource=admin';
const REDIS_URL = process.env.REDIS_URL || 'redis://:redis123@localhost:6379';

process.env.MONGODB_URI = MONGODB_URI;
process.env.REDIS_URL = REDIS_URL;

const redis = require('../config/redis');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');

async function seedUsers() {
    const users = [
        { email: 'admin@cyberdef.io', password: 'Admin@123', role: 'admin' },
        { email: 'tranghuyen20051312@gmail.com', password: 'Admin@123', role: 'admin' },
        { email: 'viewer@cyberdef.io', password: 'Viewer@123', role: 'viewer' },
    ];

    const createdUsers = [];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        const savedUser = await User.findOneAndUpdate(
            { email: user.email },
            {
                $set: {
                    email: user.email,
                    password: hashedPassword,
                    role: user.role,
                    isBlocked: false,
                },
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        ).lean();

        createdUsers.push(savedUser);
    }

    return createdUsers;
}

function buildActivityLogs() {
    const eventTypes = [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'HONEYPOT_TRIGGERED',
        'RATE_LIMIT_HIT',
        'ATTACK_SIM_BRUTE_FORCE',
        'ATTACK_SIM_SQLI',
    ];
    const ips = ['192.168.1.100', '10.0.0.55', '172.16.0.23', '45.33.32.156'];
    const severities = ['info', 'low', 'medium', 'high', 'critical'];
    const sqlPayloads = [
        "' OR 1=1 --",
        "' UNION SELECT * FROM users --",
        "'; DROP TABLE logs; --",
        "admin'--",
        "' OR 'x'='x",
    ];
    const endpoints = ['/api/auth/login', '/api/logs', '/api/risk', '/admin/secret', '/wp-admin'];

    return Array.from({ length: 30 }, (_, index) => {
        const eventType = eventTypes[index % eventTypes.length];
        const ipAddress = ips[index % ips.length];
        const severity = severities[index % severities.length];
        const riskScore = Math.min(95, Math.floor(Math.random() * 96));
        const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);

        const metadataByType = {
            LOGIN_SUCCESS: { user: index % 2 === 0 ? 'tranghuyen20051312@gmail.com' : 'viewer@cyberdef.io' },
            LOGIN_FAILED: { user: 'unknown@cyberdef.io', reason: 'Invalid credentials' },
            HONEYPOT_TRIGGERED: { endpoint: endpoints[index % endpoints.length], method: 'GET' },
            RATE_LIMIT_HIT: { endpoint: '/api/auth/login', threshold: 100 },
            ATTACK_SIM_BRUTE_FORCE: { attempt: (index % 10) + 1, password: `fakepass${index + 1}` },
            ATTACK_SIM_SQLI: { payload: sqlPayloads[index % sqlPayloads.length], endpoint: '/api/auth/login' },
        };

        return {
            eventType,
            ipAddress,
            userAgent: `Mozilla/5.0 SeedBot/${index + 1}`,
            endpoint: eventType === 'HONEYPOT_TRIGGERED' ? endpoints[index % endpoints.length] : '/api/auth/login',
            method: eventType === 'HONEYPOT_TRIGGERED' ? 'GET' : 'POST',
            metadata: metadataByType[eventType] || {},
            riskScore,
            riskReasons: eventType === 'HONEYPOT_TRIGGERED'
                ? ['Accessed honeypot endpoint', 'Attacker reconnaissance']
                : eventType === 'ATTACK_SIM_SQLI'
                    ? ['SQL injection payload detected']
                    : [],
            severity,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
    });
}

function buildSecurityEvents() {
    const ips = ['192.168.1.100', '10.0.0.55', '172.16.0.23', '45.33.32.156'];

    return [
        {
            type: 'BRUTE_FORCE',
            ipAddress: ips[0],
            description: 'Multiple failed logins detected from same IP',
            severity: 'high',
            riskScore: 70,
            evidence: { attempts: 12 },
            resolved: false,
        },
        {
            type: 'SQL_INJECTION',
            ipAddress: ips[1],
            description: 'SQL injection payloads observed in login requests',
            severity: 'high',
            riskScore: 75,
            evidence: { payloads: 5 },
            resolved: false,
        },
        {
            type: 'HONEYPOT_ACCESS',
            ipAddress: ips[2],
            description: 'Honeypot endpoint accessed during reconnaissance',
            severity: 'critical',
            riskScore: 95,
            evidence: { endpoint: '/.env' },
            resolved: false,
        },
        {
            type: 'RATE_LIMIT_ABUSE',
            ipAddress: ips[3],
            description: 'Repeated rate limit hits detected',
            severity: 'medium',
            riskScore: 55,
            evidence: { hits: 8 },
            resolved: false,
        },
        {
            type: 'ANOMALY',
            ipAddress: ips[0],
            description: 'Unusual request pattern detected by anomaly engine',
            severity: 'medium',
            riskScore: 60,
            evidence: { pattern: 'multi-endpoint scan' },
            resolved: false,
        },
    ];
}

async function main() {
    try {
        if (!redis.status || redis.status === 'end' || redis.status === 'wait') {
            await redis.connect();
        }

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        const users = await seedUsers();
        const activityLogsInput = buildActivityLogs();
        const securityEventsInput = buildSecurityEvents();

        const activityLogs = await ActivityLog.insertMany(activityLogsInput);
        const securityEvents = await SecurityEvent.insertMany(securityEventsInput);

        console.log('Seed completed successfully.');
        console.log('Users:');
        console.log(users);
        console.log('ActivityLogs:');
        console.log(activityLogs);
        console.log('SecurityEvents:');
        console.log(securityEvents);

        await mongoose.disconnect();
        await redis.quit().catch(() => { });
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);

        try {
            await mongoose.disconnect();
        } catch (_) { }

        try {
            if (redis.status !== 'end') {
                await redis.quit();
            }
        } catch (_) { }

        process.exit(1);
    }
}

main();