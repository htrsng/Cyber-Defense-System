const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply auth middleware to all tenant routes (only admin can manage tenants)
router.use(authMiddleware, adminMiddleware);

router.get('/', tenantController.getTenants);
router.get('/:id', tenantController.getTenant);
router.get('/:id/stats', tenantController.getTenantStats);
router.patch('/:id', tenantController.updateTenant);

module.exports = router;
