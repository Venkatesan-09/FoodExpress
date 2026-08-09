const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  placeOrder,
  getMyOrders,
  getOrder,
  getRestaurantOrders,
  updateOrderStatus,
  cancelOrder,
  getAvailableOrders,
  acceptDelivery,
  getActivePartnerOrder,
  getPartnerEarnings,
} = require('../controllers/orderController');

// Customer / Shared order routes
router.post('/', authenticate, placeOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/my-orders', authenticate, getMyOrders);
router.patch('/:id/cancel', authenticate, cancelOrder);

// Delivery partner
router.get('/partner/available', authenticate, getAvailableOrders);
router.get('/available-for-partner', authenticate, getAvailableOrders);
router.get('/active-partner-order', authenticate, getActivePartnerOrder);
router.get('/partner/earnings', authenticate, getPartnerEarnings);
router.patch('/:id/accept-delivery', authenticate, acceptDelivery);

// Restaurant owner
router.get('/owner/queue', authenticate, getRestaurantOrders);
router.get('/owner/orders', authenticate, getRestaurantOrders);
router.get('/restaurant/:restaurantId', authenticate, getRestaurantOrders);

// Shared: get single order (MUST be defined AFTER static named routes)
router.get('/:id', authenticate, getOrder);

// Status update
router.patch('/:id/status', authenticate, updateOrderStatus);

module.exports = router;
