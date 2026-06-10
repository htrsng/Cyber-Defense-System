const Website = require('../models/Website');
const ActivityLog = require('../models/ActivityLog');
const SecurityEvent = require('../models/SecurityEvent');

exports.getTenants = async (req, res) => {
    try {
        const tenants = await Website.find().lean();
        
        // Enrich with features and usage
        const enriched = tenants.map(t => {
            const features = Website.getPlanFeatures(t.plan);
            return {
                ...t,
                id: t._id,
                planFeatures: features,
                usagePercent: t.dailyRequestLimit > 0 ? (t.dailyRequestCount / t.dailyRequestLimit) * 100 : 0
            };
        });

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
};

exports.getTenant = async (req, res) => {
    try {
        const tenant = await Website.findById(req.params.id).lean();
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
        
        const features = Website.getPlanFeatures(tenant.plan);
        res.json({
            ...tenant,
            id: tenant._id,
            planFeatures: features
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tenant' });
    }
};

exports.getTenantStats = async (req, res) => {
    try {
        const tenantId = req.params.id;
        
        // Count total events
        const totalEvents = await ActivityLog.countDocuments({ websiteId: tenantId });
        const blockedEvents = await ActivityLog.countDocuments({ websiteId: tenantId, severity: 'critical' });
        const totalThreats = await SecurityEvent.countDocuments({ websiteId: tenantId });
        
        res.json({
            totalEvents,
            blockedEvents,
            totalThreats,
            fraudPrevented: blockedEvents * 500000 // mock value based on blocked
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tenant stats' });
    }
};

exports.updateTenant = async (req, res) => {
    try {
        const { plan, status } = req.body;
        const tenant = await Website.findById(req.params.id);
        
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
        
        if (plan) {
            tenant.plan = plan;
            tenant.dailyRequestLimit = Website.getPlanLimit(plan);
        }
        if (status) tenant.status = status;
        
        await tenant.save();
        res.json(tenant);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update tenant' });
    }
};
