const SecurityPolicy = require('../models/SecurityPolicy');
const redis = require('../config/redis');

exports.getPolicies = async (req, res) => {
    try {
        const policies = await SecurityPolicy.find().sort({ order: 1 });
        res.json(policies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
};

exports.getPolicy = async (req, res) => {
    try {
        const policy = await SecurityPolicy.findById(req.params.id);
        if (!policy) return res.status(404).json({ error: 'Policy not found' });
        res.json(policy);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch policy' });
    }
};

exports.updatePolicy = async (req, res) => {
    try {
        const { enabled, condition, action, order } = req.body;
        const policy = await SecurityPolicy.findById(req.params.id);
        
        if (!policy) return res.status(404).json({ error: 'Policy not found' });
        
        if (enabled !== undefined) policy.enabled = enabled;
        if (condition) policy.condition = condition;
        if (action) policy.action = action;
        if (order !== undefined) policy.order = order;
        
        await policy.save();
        
        // Invalidate cache
        await redis.del('security_policies');
        
        res.json(policy);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update policy' });
    }
};

exports.getPolicyStats = async (req, res) => {
    try {
        const policies = await SecurityPolicy.find({}, 'name ruleId stats');
        res.json(policies);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch policy stats' });
    }
};
