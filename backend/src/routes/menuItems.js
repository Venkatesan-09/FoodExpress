const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleStock,
} = require('../controllers/menuItemController');

// Public menu item routes
router.get('/', getMenuItems);
router.get('/restaurant/:restaurantId', getMenuItems);
router.get('/:id', getMenuItem);

// Owner-only mutations
router.post('/', authenticate, requireRole(['restaurant_owner']), createMenuItem);
router.put('/:id', authenticate, requireRole(['restaurant_owner']), updateMenuItem);
router.delete('/:id', authenticate, requireRole(['restaurant_owner']), deleteMenuItem);
router.patch('/:id/toggle-stock', authenticate, requireRole(['restaurant_owner']), toggleStock);

module.exports = router;
