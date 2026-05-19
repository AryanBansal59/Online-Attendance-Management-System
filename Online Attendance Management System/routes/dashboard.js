const express = require('express');
const dashboardController = require('../controllers/dashboard');

const router = express.Router();

router.get('/stats', dashboardController.getStats);
router.get('/profile/:userId', dashboardController.getProfile);
router.post('/profile/:userId/update', dashboardController.updateProfile);

module.exports = router;
