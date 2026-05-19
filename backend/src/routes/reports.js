const express = require('express');
const router = express.Router();
const { generateSecurityReport } = require('../services/reportService');

router.get('/security', async (req, res) => {
    try {
        const hours = Math.min(parseInt(req.query.hours, 10) || 24, 168);
        const pdfBuffer = await generateSecurityReport(hours);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cyberdef-report-${Date.now()}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Failed to generate security report:', error);
        res.status(500).json({ error: 'Failed to generate security report' });
    }
});

module.exports = router;