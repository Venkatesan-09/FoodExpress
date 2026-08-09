const Review = require('../models/Review');
const Order = require('../models/Order');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, buildPagination, parsePagination } = require('../utils/apiResponse');

/**
 * POST /api/v1/reviews
 * Auth: customer — Submit a review for a completed order
 */
const createReview = asyncHandler(async (req, res) => {
  const { orderId, restaurantRating, restaurantComment, deliveryRating, deliveryComment } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    customer: req.user._id,
    status: 'delivered',
  });
  if (!order) throw new AppError('Order not found or not yet delivered.', 404);
  if (order.isRated) throw new AppError('You have already reviewed this order.', 409);

  const review = await Review.create({
    order: orderId,
    customer: req.user._id,
    restaurant: order.restaurant,
    deliveryPartner: order.deliveryPartner,
    restaurantRating,
    restaurantComment: restaurantComment || '',
    deliveryRating: deliveryRating || null,
    deliveryComment: deliveryComment || '',
  });

  // Mark order as rated
  order.isRated = true;
  await order.save();

  sendSuccess(res, 201, 'Review submitted. Thank you!', review);
});

/**
 * GET /api/v1/reviews/restaurant/:restaurantId
 * Public: Get reviews for a restaurant
 */
const getRestaurantReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find({ restaurant: req.params.restaurantId, isVisible: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name avatar')
      .lean(),
    Review.countDocuments({ restaurant: req.params.restaurantId, isVisible: true }),
  ]);

  sendSuccess(res, 200, 'Reviews fetched', reviews, buildPagination(page, limit, total));
});

/**
 * GET /api/v1/reviews/order/:orderId
 * Auth: customer — Get review for a specific order
 */
const getOrderReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    order: req.params.orderId,
    customer: req.user._id,
  }).lean();

  sendSuccess(res, 200, 'Review fetched', review);
});

module.exports = { createReview, getRestaurantReviews, getOrderReview };
