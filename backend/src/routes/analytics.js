const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/attacks', analyticsController.getAttacks);
router.get('/fraud', analyticsController.getFraud);
router.get('/overview', analyticsController.getOverview);

module.exports = router;
