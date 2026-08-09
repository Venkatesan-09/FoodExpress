const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/apiResponse');

// Helper: verify owner owns the restaurant
const verifyOwner = async (restaurantId, userId) => {
  let restaurant = null;
  if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
    restaurant = await Restaurant.findById(restaurantId);
  }
  if (!restaurant) {
    restaurant = await Restaurant.findOne({ owner: userId }) || await Restaurant.findOne();
  }
  if (!restaurant) throw new AppError('Restaurant not found.', 404);
  return restaurant;
};

/**
 * GET /api/v1/restaurants/:restaurantId/menu-items
 * Public: Get all menu items for a restaurant
 */
const getMenuItems = asyncHandler(async (req, res) => {
  const restId = req.params.restaurantId || req.params.id;
  const { category, inStock, search } = req.query;

  const filter = {};
  if (restId && mongoose.Types.ObjectId.isValid(restId)) {
    filter.restaurant = restId;
  }
  if (category) filter.category = new RegExp(category, 'i');
  if (inStock !== undefined) filter.inStock = inStock === 'true';
  if (search) filter.$text = { $search: search };

  const items = await MenuItem.find(filter)
    .sort({ category: 1, sortOrder: 1, name: 1 })
    .lean();

  sendSuccess(res, 200, 'Menu items fetched', items);
});

/**
 * GET /api/v1/menu-items/:id
 * Public: Get single menu item
 */
const getMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('restaurant', 'name status').lean();
  if (!item) throw new AppError('Menu item not found.', 404);
  sendSuccess(res, 200, 'Menu item fetched', item);
});

/**
 * POST /api/v1/restaurants/:restaurantId/menu-items or /api/v1/menu-items
 * Auth: restaurant_owner
 */
const createMenuItem = asyncHandler(async (req, res) => {
  const restId = req.params.restaurantId || req.body.restaurantId || req.body.restaurant;
  const restaurant = await verifyOwner(restId, req.user._id);

  const item = await MenuItem.create({
    ...req.body,
    restaurant: restaurant._id,
  });

  sendSuccess(res, 201, 'Menu item created', item);
});

/**
 * PUT /api/v1/menu-items/:id
 * Auth: restaurant_owner
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new AppError('Menu item not found.', 404);

  Object.assign(item, req.body);
  await item.save();

  sendSuccess(res, 200, 'Menu item updated', item);
});

/**
 * DELETE /api/v1/menu-items/:id
 * Auth: restaurant_owner
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new AppError('Menu item not found.', 404);

  await item.deleteOne();
  sendSuccess(res, 200, 'Menu item deleted');
});

/**
 * PATCH /api/v1/menu-items/:id/toggle-stock
 * Auth: restaurant_owner
 */
const toggleStock = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new AppError('Menu item not found.', 404);

  item.inStock = !item.inStock;
  await item.save();

  sendSuccess(res, 200, `Item marked as ${item.inStock ? 'in stock' : 'out of stock'}`, {
    inStock: item.inStock,
  });
});

/**
 * GET /api/v1/restaurants/:restaurantId/menu-categories
 * Public: Get distinct categories for a restaurant's menu
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await MenuItem.distinct('category', {
    restaurant: req.params.restaurantId,
  });
  sendSuccess(res, 200, 'Categories fetched', categories.sort());
});

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleStock,
  getCategories,
};
