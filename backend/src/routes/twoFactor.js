const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const twoFactorController = require('../controllers/twoFactorController');

const router = express.Router();

router.post('/setup', authMiddleware, twoFactorController.setup);
router.post('/verify', authMiddleware, twoFactorController.verify);
router.post('/validate', twoFactorController.validate);
router.post('/disable', authMiddleware, twoFactorController.disable);
router.get('/status', authMiddleware, twoFactorController.status);

module.exports = router;