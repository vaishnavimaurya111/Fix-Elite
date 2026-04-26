const express = require('express');
const { analyzeProblem } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/estimate', protect, analyzeProblem);

module.exports = router;
