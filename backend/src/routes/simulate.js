const express = require('express');
const simulateController = require('../controllers/simulateController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All simulate endpoints require auth + admin role
router.post('/brute-force', authMiddleware, adminMiddleware, (req, res) => {
    const io = req.app.get('io');
    return simulateController.bruteForce(req, res, io);
});

router.post('/sqli', authMiddleware, adminMiddleware, (req, res) => {
    const io = req.app.get('io');
    return simulateController.sqli(req, res, io);
});

router.post('/honeypot', authMiddleware, adminMiddleware, (req, res) => {
    const io = req.app.get('io');
    return simulateController.honeypot(req, res, io);
});

module.exports = router;
