const express = require('express');
const simulateController = require('../controllers/simulateController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Simulate endpoints are made public for the Live Demo Attacker Console.
// Rate limiting is handled globally.
router.post('/brute-force', (req, res) => {
    const io = req.app.get('io');
    return simulateController.bruteForce(req, res, io);
});

router.post('/sqli', (req, res) => {
    const io = req.app.get('io');
    return simulateController.sqli(req, res, io);
});

router.post('/honeypot', (req, res) => {
    const io = req.app.get('io');
    return simulateController.honeypot(req, res, io);
});

module.exports = router;
