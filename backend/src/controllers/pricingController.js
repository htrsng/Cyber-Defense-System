const Website = require('../models/Website');

exports.getPlans = async (req, res) => {
    try {
        const plans = [
            {
                id: 'free',
                name: 'FREE',
                price: '$0',
                period: '/mo',
                features: Website.getPlanFeatures('free')
            },
            {
                id: 'pro',
                name: 'PRO',
                price: '$9',
                period: '/mo',
                recommended: true,
                features: Website.getPlanFeatures('pro')
            },
            {
                id: 'enterprise',
                name: 'ENTERPRISE',
                price: '$49',
                period: '/mo',
                features: Website.getPlanFeatures('enterprise')
            }
        ];
        res.json(plans);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch pricing plans' });
    }
};

exports.getCompare = async (req, res) => {
    // Feature comparison matrix data
    res.json({
        categories: [
            {
                name: 'Core Features',
                features: [
                    { name: 'Websites', free: '1', pro: '10', enterprise: 'Unlimited' },
                    { name: 'Requests/day', free: '1,000', pro: '100,000', enterprise: 'Unlimited' },
                ]
            },
            {
                name: 'Security Protection',
                features: [
                    { name: 'WAF Protection', free: 'Basic', pro: 'Full', enterprise: 'Full + Custom Rules' },
                    { name: 'Risk Scoring', free: false, pro: 'AI-Powered', enterprise: 'AI-Powered' },
                    { name: 'Tarpit Defense', free: false, pro: true, enterprise: true },
                    { name: 'Honeypot System', free: false, pro: true, enterprise: true },
                ]
            },
            {
                name: 'Management & Reporting',
                features: [
                    { name: 'Email Alerts', free: false, pro: true, enterprise: 'Priority' },
                    { name: 'PDF Reports', free: false, pro: 'Monthly', enterprise: 'Daily' },
                    { name: 'Custom Security Rules', free: false, pro: false, enterprise: true },
                    { name: 'SLA', free: '-', pro: '99.9%', enterprise: '99.99%' },
                ]
            }
        ]
    });
};

exports.upgradePlan = async (req, res) => {
    try {
        const { tenantId, planId } = req.body;
        const tenant = await Website.findById(tenantId);
        
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
        
        // Simulating upgrade
        tenant.plan = planId;
        tenant.dailyRequestLimit = Website.getPlanLimit(planId);
        tenant.subscription.status = 'active';
        await tenant.save();
        
        res.json({ success: true, tenant });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upgrade plan' });
    }
};
