const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { createReview, getRestaurantReviews, getOrderReview } = require('../controllers/reviewController');

router.post('/', authenticate, requireRole(['customer']), createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/order/:orderId', authenticate, getOrderReview);

module.exports = router;
