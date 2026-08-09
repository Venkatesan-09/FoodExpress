const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');

// All admin routes require admin role
router.use(authenticate, requireRole(['admin']));

router.get('/stats', getPlatformStats);

// Restaurants
router.get('/restaurants', adminGetRestaurants);
router.patch('/restaurants/:id/approve', approveRestaurant);
router.patch('/restaurants/:id/reject', rejectRestaurant);
router.patch('/restaurants/:id/suspend', suspendRestaurant);

// Users
router.get('/users', adminGetUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);


// Partners
router.patch('/partners/:id/approve', approvePartner);

// Orders
router.get('/orders', adminGetOrders);

// Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Mock Email Inbox
router.get('/mock-emails', getMockEmails);

module.exports = router;
