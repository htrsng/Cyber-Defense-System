const express = require('express');
const router  = express.Router();
router.get('/', (req, res) => res.json({ data: [], message: 'coming soon' }));
module.exports = router;
