const Coupon = require('../models/Coupon');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, buildPagination, parsePagination } = require('../utils/apiResponse');

/**
 * POST /api/v1/coupons/validate
 * Auth: customer — Validate a coupon code before checkout
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue, restaurantId } = req.body;
  if (!code) throw new AppError('Coupon code is required.', 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isValid) {
    throw new AppError('Coupon is invalid or expired.', 400);
  }
  if (orderValue < coupon.minOrderValue) {
    throw new AppError(`Minimum order value for this coupon is ₹${coupon.minOrderValue}.`, 400);
  }
  if (coupon.scope === 'restaurant' && coupon.restaurant?.toString() !== restaurantId) {
    throw new AppError('This coupon is not valid for this restaurant.', 400);
  }
  if (coupon.usedBy.includes(req.user._id)) {
    throw new AppError('You have already used this coupon.', 400);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderValue * coupon.value) / 100;
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = coupon.value;
  }
  discountAmount = Math.min(Math.round(discountAmount), orderValue);

  sendSuccess(res, 200, 'Coupon applied', {
    code: coupon.code,
    description: coupon.description,
    discountType: coupon.discountType,
    value: coupon.value,
    discountAmount,
    newTotal: orderValue - discountAmount,
  });
});

/**
 * POST /api/v1/coupons (Admin only)
 */
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
  sendSuccess(res, 201, 'Coupon created', coupon);
});

/**
 * GET /api/v1/coupons (Admin only)
 */
const getCoupons = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { isActive, scope } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (scope) filter.scope = scope;

  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Coupons fetched', coupons, buildPagination(page, limit, total));
});

/**
 * PUT /api/v1/coupons/:id (Admin only)
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new AppError('Coupon not found.', 404);
  sendSuccess(res, 200, 'Coupon updated', coupon);
});

/**
 * DELETE /api/v1/coupons/:id (Admin only)
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('Coupon not found.', 404);
  sendSuccess(res, 200, 'Coupon deleted');
});

module.exports = { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon };
