const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

// Pricing details are public/accessible by non-admins for viewing
router.get('/plans', pricingController.getPlans);
router.get('/compare', pricingController.getCompare);

// Upgrade requires auth (and potentially admin, but let's keep it simple for demo)
const { authMiddleware } = require('../middleware/auth');
router.post('/upgrade', authMiddleware, pricingController.upgradePlan);

module.exports = router;
