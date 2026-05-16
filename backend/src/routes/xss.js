const express = require('express');
const xssController = require('../controllers/xssController');

const router = express.Router();

router.post('/vulnerable', (req, res) => xssController.vulnerable(req, res));
router.post('/protected', (req, res) => xssController.protected(req, res));
router.post('/simulate', (req, res) => xssController.simulate(req, res));

module.exports = router;