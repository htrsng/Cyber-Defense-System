const express = require('express');
const { authMiddleware: jwtMiddleware } = require('../middleware/auth');
const payguardController = require('../controllers/payguardController');

const router = express.Router();

router.get('/status', payguardController.getStatus);
router.post('/status', payguardController.updateStatus);
router.use(jwtMiddleware);

router.get('/wallet', payguardController.getWallet);
router.post('/deposit', payguardController.deposit);
router.post('/transfer', payguardController.transfer);
router.post('/withdraw', payguardController.withdraw);
router.post('/category/update', payguardController.updateCategory);
router.get('/transactions', payguardController.getTransactions);

module.exports = router;