const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const MockEmail = require('../models/MockEmail');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, buildPagination, parsePagination } = require('../utils/apiResponse');

/**
 * GET /api/v1/admin/stats
 * Admin: Platform analytics overview
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalRestaurants,
    totalOrders,
    revenueAgg,
    pendingRestaurants,
    pendingPartners,
    recentOrders,
    ordersByStatus,
    dailyRevenue,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Restaurant.countDocuments({ status: 'approved' }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: 'delivered', 'payment.status': 'success' } },
      { $group: { _id: null, total: { $sum: '$billBreakdown.total' } } },
    ]),
    Restaurant.countDocuments({ status: 'pending_approval' }),
    User.countDocuments({ role: 'delivery_partner', verificationStatus: 'pending_verification' }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('restaurant', 'name').populate('customer', 'name').lean(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    // Last 7 days revenue
    Order.aggregate([
      {
        $match: {
          status: 'delivered',
          'payment.status': 'success',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$billBreakdown.total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  sendSuccess(res, 200, 'Platform stats fetched', {
    overview: {
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingRestaurants,
      pendingPartners,
    },
    recentOrders,
    ordersByStatus,
    dailyRevenue,
  });
});

/**
 * GET /api/v1/admin/restaurants
 * Admin: Get all restaurants with optional status filter
 */
const adminGetRestaurants = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email phone')
      .lean(),
    Restaurant.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Restaurants fetched', restaurants, buildPagination(page, limit, total));
});

/**
 * PATCH /api/v1/admin/restaurants/:id/approve
 */
const approveRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', rejectionReason: '' },
    { new: true }
  ).populate('owner', 'name email');

  if (!restaurant) throw new AppError('Restaurant not found.', 404);
  sendSuccess(res, 200, 'Restaurant approved', restaurant);
});

/**
 * PATCH /api/v1/admin/restaurants/:id/reject
 */
const rejectRestaurant = asyncHandler(async (req, res) => {
  const { reason = 'Does not meet platform requirements.' } = req.body;
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: reason },
    { new: true }
  );
  if (!restaurant) throw new AppError('Restaurant not found.', 404);
  sendSuccess(res, 200, 'Restaurant rejected', restaurant);
});

/**
 * PATCH /api/v1/admin/restaurants/:id/suspend
 */
const suspendRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { status: 'suspended', isOpen: false },
    { new: true }
  );
  if (!restaurant) throw new AppError('Restaurant not found.', 404);
  sendSuccess(res, 200, 'Restaurant suspended', restaurant);
});

/**
 * GET /api/v1/admin/users
 * Admin: Get all users
 */
const adminGetUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { role, search, isActive } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Users fetched', users, buildPagination(page, limit, total));
});

/**
 * PATCH /api/v1/admin/users/:id/toggle-active
 * Admin: Suspend/unsuspend a user
 */
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.role === 'admin') throw new AppError('Cannot modify admin accounts.', 403);

  user.isActive = !user.isActive;
  await user.save();

  sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'suspended'}`, { isActive: user.isActive });
});

/**
 * PATCH /api/v1/admin/partners/:id/approve
 */
const approvePartner = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'delivery_partner' });
  if (!user) throw new AppError('Delivery partner not found.', 404);

  user.verificationStatus = 'approved';
  user.isVerified = true;
  await user.save();

  sendSuccess(res, 200, 'Delivery partner approved', user);
});

/**
 * GET /api/v1/admin/orders
 * Admin: All orders
 */
const adminGetOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, restaurantId } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (restaurantId) filter.restaurant = restaurantId;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('restaurant', 'name')
      .populate('customer', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Orders fetched', orders, buildPagination(page, limit, total));
});

/**
 * GET /api/v1/admin/mock-emails
 * Admin: View mock email inbox
 */
const getMockEmails = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { read } = req.query;

  const filter = {};
  if (read !== undefined) filter.read = read === 'true';

  const [emails, total] = await Promise.all([
    MockEmail.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MockEmail.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Mock emails fetched', emails, buildPagination(page, limit, total));
});

/**
 * DELETE /api/v1/admin/users/:id
 * Admin: Cancel account & revoke email access
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.role === 'admin') throw new AppError('Cannot delete admin accounts.', 403);

  // Soft-delete: suspend and mark as cancelled
  user.isActive = false;
  user.email = `cancelled_${Date.now()}_${user.email}`;
  await user.save();

  sendSuccess(res, 200, 'User account cancelled and access revoked.', { id: user._id });
});

module.exports = {
  getPlatformStats,
  adminGetRestaurants,
  approveRestaurant,
  rejectRestaurant,
  suspendRestaurant,
  adminGetUsers,
  toggleUserActive,
  deleteUser,
  approvePartner,
  adminGetOrders,
  getMockEmails,
};
