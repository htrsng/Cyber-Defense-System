const SecurityPolicy = require('../models/SecurityPolicy');
const redis = require('../config/redis');

async function getActivePolicies() {
    try {
        let cached = await redis.get('security_policies').catch(() => null);
        if (cached) {
            return JSON.parse(cached);
        }
        const policies = await SecurityPolicy.find({ enabled: true }).sort({ order: 1 }).lean();
        await redis.setex('security_policies', 60, JSON.stringify(policies)).catch(() => {});
        return policies;
    } catch (error) {
        console.error("Error fetching policies", error);
        return [];
    }
}

function evaluateCondition(policy, riskResult) {
    const { metric, operator, threshold } = policy.condition;
    let actualValue = 0;

    if (metric === 'total_risk') {
        actualValue = riskResult.score;
    } else if (metric === 'brute_force_rate') {
        actualValue = riskResult.signals?.failedLogins || 0;
    } else {
        const factorMap = {
            'sqli_risk': 'SQLi Payload',
            'xss_risk': 'XSS Payload',
            'reputation_risk': 'IP Reputation',
            'velocity_risk': 'Request Velocity'
        };
        const targetFactor = factorMap[metric];
        if (targetFactor && riskResult.breakdown) {
            const factorBreakdown = riskResult.breakdown.find(b => b.factor === targetFactor);
            if (factorBreakdown) {
                actualValue = factorBreakdown.score;
            }
        }
    }

    switch (operator) {
        case '>': return actualValue > threshold;
        case '>=': return actualValue >= threshold;
        case '<': return actualValue < threshold;
        case '<=': return actualValue <= threshold;
        case '==': return actualValue === threshold;
        default: return false;
    }
}

async function evaluateRules(riskResult, requestContext) {
    const policies = await getActivePolicies();
    const result = {
        shouldBlock: false,
        shouldTarpit: false,
        shouldAlert: false,
        matchedRules: [],
    };

    for (const policy of policies) {
        if (evaluateCondition(policy, riskResult)) {
            result.matchedRules.push(policy);
            
            if (policy.action === 'block') result.shouldBlock = true;
            if (policy.action === 'tarpit') result.shouldTarpit = true;
            if (policy.action === 'email_alert') result.shouldAlert = true;

            // Increment trigger stats async
            SecurityPolicy.updateOne(
                { _id: policy._id },
                { 
                    $inc: { 'stats.triggered': 1 },
                    $set: { 'stats.lastTriggered': new Date() }
                }
            ).exec().catch(() => {});
        }
    }

    return result;
}

module.exports = { evaluateRules, getActivePolicies };
