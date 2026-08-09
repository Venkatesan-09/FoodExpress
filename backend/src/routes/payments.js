const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { mockCharge, getPaymentDetails } = require('../controllers/paymentController');

// MOCKED: replace endpoints with real gateway integration
router.post('/mock-charge', authenticate, requireRole(['customer']), mockCharge);
router.get('/order/:orderId', authenticate, getPaymentDetails);

module.exports = router;
