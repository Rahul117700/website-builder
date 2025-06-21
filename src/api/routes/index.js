const express = require('express');
const router = express.Router();

/**
 * @route   GET /api
 * @desc    API status check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
