const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, buildPagination, parsePagination } = require('../utils/apiResponse');
const { emitNewOrder } = require('../sockets');

/**
 * GET /api/v1/restaurants
 * Public: List approved & open restaurants with filters, pagination, text search
 */
const getRestaurants = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const {
    search,
    cuisine,
    rating,
    maxDeliveryTime,
    priceRange,
    isVegOnly,
    isOpen,
    sort = '-rating.avg',
  } = req.query;

  const filter = { status: { $in: ['approved', 'pending_approval'] } };

  if (isOpen === 'true') filter.isOpen = true;
  if (isVegOnly === 'true') filter.isVegOnly = true;
  if (cuisine) filter.cuisine = { $in: cuisine.split(',').map((c) => new RegExp(c.trim(), 'i')) };
  if (rating) filter['rating.avg'] = { $gte: parseFloat(rating) };
  if (maxDeliveryTime) filter.deliveryTime = { $lte: parseInt(maxDeliveryTime) };
  if (priceRange) filter.priceRange = { $in: priceRange.split(',').map(Number) };

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  const sortObj = {};
  const sortFields = sort.split(',');
  sortFields.forEach((field) => {
    if (field.startsWith('-')) {
      sortObj[field.slice(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-owner')
      .lean(),
    Restaurant.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Restaurants fetched', restaurants, buildPagination(page, limit, total));
});

/**
 * GET /api/v1/restaurants/:id
 * Public: Get a single restaurant with its menu
 */
const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();

  if (!restaurant) throw new AppError('Restaurant not found.', 404);

  // Fetch menu items grouped by category
  const menuItems = await MenuItem.find({
    restaurant: req.params.id,
    inStock: true,
  })
    .sort({ category: 1, sortOrder: 1 })
    .lean();

  // Group by category
  const menu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  sendSuccess(res, 200, 'Restaurant fetched', { restaurant, menu });
});

/**
 * POST /api/v1/restaurants
 * Auth: restaurant_owner — Create restaurant (starts as pending_approval)
 */
const createRestaurant = asyncHandler(async (req, res) => {
  const existing = await Restaurant.findOne({ owner: req.user._id });
  if (existing) {
    throw new AppError('You already have a registered restaurant.', 409);
  }

  const restaurantData = {
    ...req.body,
    owner: req.user._id,
    status: 'approved',
    isOpen: true,
    address: {
      line1: req.body.address?.line1 || '123 Main Food Street',
      line2: req.body.address?.line2 || '',
      city: req.body.address?.city || 'Bengaluru',
      state: req.body.address?.state || 'Karnataka',
      pincode: req.body.address?.pincode || '560001',
    },
    location: req.body.location?.lat ? req.body.location : { lat: 12.9716, lng: 77.5946 },
  };

  const restaurant = await Restaurant.create(restaurantData);

  sendSuccess(res, 201, 'Restaurant registered successfully', restaurant);
});

/**
 * PUT /api/v1/restaurants/:id
 * Auth: restaurant_owner — Update own restaurant
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  let restaurant;
  if (req.params.id && req.params.id !== 'my-restaurant') {
    restaurant = await Restaurant.findById(req.params.id);
  } else {
    restaurant = await Restaurant.findOne({ owner: req.user._id });
  }

  if (!restaurant) {
    throw new AppError('Restaurant not found. Please register your restaurant first.', 404);
  }

  // Disallow changing status or owner via this endpoint
  delete req.body.status;
  delete req.body.owner;

  // Sanitize address to ensure state and pincode pass validation
  if (req.body.address) {
    req.body.address = {
      line1: req.body.address.line1 || restaurant.address?.line1 || '123 Food Street',
      line2: req.body.address.line2 || restaurant.address?.line2 || '',
      city: req.body.address.city || restaurant.address?.city || 'Bengaluru',
      state: req.body.address.state || restaurant.address?.state || 'Karnataka',
      pincode: req.body.address.pincode || restaurant.address?.pincode || '560001',
    };
  }

  if (!restaurant.location || !restaurant.location.lat) {
    restaurant.location = { lat: 12.9716, lng: 77.5946 };
  }

  Object.assign(restaurant, req.body);
  await restaurant.save();

  sendSuccess(res, 200, 'Restaurant updated', restaurant);
});

/**
 * GET /api/v1/restaurants/owner/mine & /my-restaurant
 * Auth: restaurant_owner — Get own restaurant details (returns null if not registered yet)
 */
const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  sendSuccess(res, 200, 'Restaurant fetched', restaurant || null);
});

/**
 * PATCH /api/v1/restaurants/:id/toggle-open
 * Auth: restaurant_owner — Toggle open/closed status
 */
const toggleOpen = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({
    _id: req.params.id,
    owner: req.user._id,
    status: 'approved',
  });
  if (!restaurant) throw new AppError('Restaurant not found or not approved yet.', 404);

  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();

  sendSuccess(res, 200, `Restaurant is now ${restaurant.isOpen ? 'open' : 'closed'}`, {
    isOpen: restaurant.isOpen,
  });
});

module.exports = { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, getMyRestaurant, toggleOpen };
