const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/', policyController.getPolicies);
router.get('/stats', policyController.getPolicyStats);
router.get('/:id', policyController.getPolicy);
router.patch('/:id', policyController.updatePolicy);

module.exports = router;
