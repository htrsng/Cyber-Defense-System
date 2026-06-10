const mongoose = require('mongoose');
require('dotenv').config();
const Website = require('../models/Website');
const SecurityPolicy = require('../models/SecurityPolicy');
const User = require('../models/User');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:secret123@localhost:27017/cyberdefense?authSource=admin');
        console.log('Connected to MongoDB');

        // Check if user exists, else get the first admin or create one
        let user = await User.findOne({ role: 'admin' });
        if (!user) {
            console.log('No admin user found. Creating dummy admin.');
            user = await User.create({ email: 'admin@payguard.vn', password: 'password123', role: 'admin' });
        }

        // Seed Tenants (Websites)
        const websites = await Website.find();
        if (websites.length < 3) {
            const payguard = await Website.findOneAndUpdate(
                { websiteName: 'PayGuard' },
                {
                    websiteName: 'PayGuard',
                    domain: 'payguard.vn',
                    apiKey: 'cdf_live_payguard_demo_key_001',
                    ownerId: user._id,
                    plan: 'pro',
                    status: 'active',
                    subscription: { status: 'active' }
                },
                { upsert: true, new: true }
            );

            await Website.findOneAndUpdate(
                { websiteName: 'ShopNow' },
                {
                    websiteName: 'ShopNow',
                    domain: 'shopnow.vn',
                    apiKey: 'cdf_live_shopnow_demo_key_002',
                    ownerId: user._id,
                    plan: 'free',
                    status: 'active',
                    subscription: { status: 'trial' }
                },
                { upsert: true }
            );

            await Website.findOneAndUpdate(
                { websiteName: 'EduPortal' },
                {
                    websiteName: 'EduPortal',
                    domain: 'eduportal.vn',
                    apiKey: 'cdf_live_eduportal_demo_key_003',
                    ownerId: user._id,
                    plan: 'free',
                    status: 'active',
                    subscription: { status: 'trial' }
                },
                { upsert: true }
            );
            console.log('Seeded Tenants');
        }

        // Seed Security Policies
        const policiesCount = await SecurityPolicy.countDocuments();
        if (policiesCount === 0) {
            const rules = [
                {
                    name: 'SQL Injection Protection',
                    ruleId: 'rule_sqli_block',
                    condition: { metric: 'sqli_risk', operator: '>', threshold: 70 },
                    action: 'block',
                    severity: 'critical'
                },
                {
                    name: 'Brute Force Defense',
                    ruleId: 'rule_brute_tarpit',
                    condition: { metric: 'velocity_risk', operator: '>=', threshold: 10 }, // 10 score
                    action: 'tarpit',
                    severity: 'medium'
                },
                {
                    name: 'Critical Risk Alert',
                    ruleId: 'rule_critical_alert',
                    condition: { metric: 'total_risk', operator: '>=', threshold: 90 },
                    action: 'email_alert',
                    severity: 'high'
                },
                {
                    name: 'XSS Attack Prevention',
                    ruleId: 'rule_xss_block',
                    condition: { metric: 'xss_risk', operator: '>', threshold: 60 },
                    action: 'block',
                    severity: 'critical'
                },
                {
                    name: 'Suspicious Activity Log',
                    ruleId: 'rule_suspicious_log',
                    condition: { metric: 'total_risk', operator: '>', threshold: 40 },
                    action: 'log',
                    severity: 'low'
                }
            ];

            await SecurityPolicy.insertMany(rules);
            console.log('Seeded Security Policies');
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
