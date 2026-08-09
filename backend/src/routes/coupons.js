const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  validateCoupon,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

// Customer: validate coupon at checkout
router.post('/validate', authenticate, requireRole(['customer']), validateCoupon);

// Admin: CRUD operations for coupons
router.get('/', authenticate, getCoupons);
router.post('/', authenticate, requireRole(['admin']), createCoupon);
router.put('/:id', authenticate, requireRole(['admin']), updateCoupon);
router.delete('/:id', authenticate, requireRole(['admin']), deleteCoupon);

module.exports = router;
