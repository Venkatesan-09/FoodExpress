const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { validateCoupon } = require('../controllers/couponController');

// Customer: validate coupon at checkout
router.post('/validate', authenticate, requireRole(['customer']), validateCoupon);

module.exports = router;
