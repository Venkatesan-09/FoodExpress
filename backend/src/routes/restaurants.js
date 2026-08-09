const express = require('express');
const router = express.Router();
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  getMyRestaurant,
  toggleOpen,
} = require('../controllers/restaurantController');
const { getMenuItems, getCategories } = require('../controllers/menuItemController');
const { getRestaurantReviews } = require('../controllers/reviewController');
const menuItemRoutes = require('./menuItems');

// Public
router.get('/', optionalAuth, getRestaurants);
router.get('/owner/mine', authenticate, getMyRestaurant);
router.get('/my-restaurant', authenticate, getMyRestaurant);
router.get('/:id', getRestaurant);
router.get('/:restaurantId/menu-items', getMenuItems);
router.get('/:restaurantId/categories', getCategories);
router.get('/:restaurantId/reviews', getRestaurantReviews);

// Protected — restaurant owner
router.post('/', authenticate, createRestaurant);
router.put('/my-restaurant', authenticate, updateRestaurant);
router.put('/:id', authenticate, updateRestaurant);
router.patch('/:id/toggle-open', authenticate, toggleOpen);

// Nested menu items
router.use('/:restaurantId/menu-items', menuItemRoutes);

module.exports = router;
