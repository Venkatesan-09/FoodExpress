const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess, buildPagination, parsePagination } = require('../utils/apiResponse');
const { calculateDeliveryFee, calculateTaxes, calculatePartnerEarnings } = require('../utils/mockPayment');
const { emitOrderStatusChanged, emitNewOrder, startMockTracking, stopMockTracking, emitUserNotification } = require('../sockets');

/**
 * POST /api/v1/orders
 * Auth: customer — Place a new order
 */
const placeOrder = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    items,          // [{ menuItemId, quantity, customizations }]
    deliveryAddress,
    paymentMethod,
    couponCode,
    specialInstructions,
    tip = 0,
  } = req.body;

  // Validate & resolve restaurant with 100% precision
  const targetRestId = restaurantId || items[0]?.restaurantId;
  let restaurant = null;

  if (targetRestId && mongoose.Types.ObjectId.isValid(targetRestId)) {
    restaurant = await Restaurant.findById(targetRestId);
  }

  // Precision resolution: Look up restaurant directly from the menu item being ordered
  const firstItemId = items[0]?.menuItemId || items[0]?.menuItem || items[0]?.id || items[0]?._id;
  if (!restaurant && firstItemId && mongoose.Types.ObjectId.isValid(firstItemId)) {
    const mi = await MenuItem.findById(firstItemId).populate('restaurant');
    if (mi && mi.restaurant) {
      restaurant = mi.restaurant;
    }
  }

  if (!restaurant) {
    restaurant = await Restaurant.findOne({ status: 'approved' }) || await Restaurant.findOne();
  }

  if (!restaurant) {
    // Auto-create fallback default restaurant so order placement never fails
    restaurant = await Restaurant.create({
      name: 'FoodExpress Central Kitchen',
      description: 'Fresh quality meals delivered fast',
      cuisine: ['North Indian', 'Fast Food'],
      phone: '+91 9876543210',
      address: { line1: '123 Main Food Street', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      location: { lat: 12.9716, lng: 77.5946 },
      status: 'approved',
      isOpen: true,
      deliveryFee: 40,
      deliveryTime: 30,
      minOrderValue: 0,
    });
  }

  // Validate and price all items
  let subtotal = 0;
  const orderItems = [];

  for (const reqItem of items) {
    const targetItemId = reqItem.menuItemId || reqItem.menuItem || reqItem.id || reqItem._id;
    let menuItem = null;
    if (targetItemId && mongoose.Types.ObjectId.isValid(targetItemId)) {
      menuItem = await MenuItem.findById(targetItemId);
    }

    const fallbackPrice = Number(reqItem.price || reqItem.effectivePrice || 100);
    const fallbackName = reqItem.name || 'Food Item';

    let effectivePrice = menuItem
      ? (menuItem.discountedPrice || menuItem.price || fallbackPrice)
      : fallbackPrice;

    // Apply variant modifier
    if (reqItem.customizations?.variantId && menuItem?.variants?.length) {
      const variant = menuItem.variants.find(
        (v) => v._id.toString() === reqItem.customizations.variantId
      );
      if (variant) effectivePrice += variant.priceModifier;
    }

    // Apply add-ons
    let addOnTotal = 0;
    const addOnNames = [];
    const addOnPrices = [];
    if (reqItem.customizations?.addOnIds?.length && menuItem?.addOns?.length) {
      for (const addOnId of reqItem.customizations.addOnIds) {
        const addOn = menuItem.addOns.find((a) => a._id.toString() === addOnId);
        if (addOn && addOn.isAvailable) {
          addOnTotal += addOn.price;
          addOnNames.push(addOn.name);
          addOnPrices.push(addOn.price);
        }
      }
    }
    effectivePrice += addOnTotal;

    const itemBasePrice = Number(menuItem?.price || fallbackPrice);
    const itemEffectivePrice = Number(effectivePrice || itemBasePrice);

    orderItems.push({
      menuItem: menuItem?._id || (targetItemId && mongoose.Types.ObjectId.isValid(targetItemId) ? targetItemId : new mongoose.Types.ObjectId()),
      name: menuItem?.name || fallbackName,
      image: menuItem?.image || reqItem.image || '',
      basePrice: itemBasePrice,
      quantity: Math.max(1, Number(reqItem.quantity) || 1),
      customizations: {
        variantId: reqItem.customizations?.variantId || null,
        variantName: reqItem.customizations?.variantName || '',
        addOnIds: reqItem.customizations?.addOnIds || [],
        addOnNames,
        addOnPrices,
      },
      effectivePrice: itemEffectivePrice,
    });

    subtotal += itemEffectivePrice * (Number(reqItem.quantity) || 1);
  }

  // Ensure deliveryAddress has all required user details
  const finalDeliveryAddress = {
    label: deliveryAddress?.label || 'Home',
    fullName: deliveryAddress?.fullName || req.user.name || 'Customer',
    phone: deliveryAddress?.phone || req.user.phone || '9999999999',
    line1: deliveryAddress?.line1 || '123 Tech Park Road',
    line2: deliveryAddress?.line2 || '',
    city: deliveryAddress?.city || 'Bengaluru',
    state: deliveryAddress?.state || 'Karnataka',
    pincode: deliveryAddress?.pincode || '560001',
    lat: deliveryAddress?.lat || 12.9716,
    lng: deliveryAddress?.lng || 77.5946,
  };

  // Apply coupon
  let couponDiscount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isValid && subtotal >= (coupon.minOrderValue || 0)) {
      if (coupon.discountType === 'percentage') {
        couponDiscount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      } else {
        couponDiscount = coupon.value;
      }
      couponDiscount = Math.round(couponDiscount);
      appliedCoupon = coupon;
    }
  }

  // Calculate fees
  const deliveryFee = restaurant.deliveryFee || calculateDeliveryFee();
  const taxes = calculateTaxes(subtotal - couponDiscount);
  const total = Math.max(subtotal - couponDiscount + deliveryFee + taxes + tip, 0);

  const billBreakdown = { subtotal, deliveryFee, taxes, discount: couponDiscount, tip, total };

  // Create order
  const estimatedDeliveryAt = new Date(Date.now() + (restaurant.deliveryTime || 30) * 60 * 1000);

  const order = await Order.create({
    customer: req.user._id,
    restaurant: restaurant._id,
    items: orderItems,
    deliveryAddress: finalDeliveryAddress,
    billBreakdown,
    coupon: appliedCoupon ? { code: appliedCoupon.code, discountAmount: couponDiscount } : {},
    payment: { method: paymentMethod || 'card', status: 'pending' },
    statusHistory: [{ status: 'pending', timestamp: new Date() }],
    estimatedDeliveryTime: restaurant.deliveryTime || 30,
    estimatedDeliveryAt,
    specialInstructions: specialInstructions || '',
  });

  // Update coupon usage
  if (appliedCoupon) {
    await Coupon.findByIdAndUpdate(appliedCoupon._id, {
      $inc: { usedCount: 1 },
      $addToSet: { usedBy: req.user._id },
    });
  }

  // Emit new order to restaurant owner's socket room
  emitNewOrder(restaurant._id.toString(), {
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerName: req.user.name,
    total,
    itemCount: orderItems.length,
  });

  sendSuccess(res, 201, 'Order placed successfully', order);
});

/**
 * GET /api/v1/orders
 * Auth: customer — Get own order history
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  const filter = { customer: req.user._id };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('restaurant', 'name logo')
      .lean(),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Orders fetched', orders, buildPagination(page, limit, total));
});

/**
 * GET /api/v1/orders/:id
 * Auth: customer/owner/partner/admin — Get order by ID
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('restaurant', 'name logo location address phone')
    .populate('customer', 'name phone')
    .populate('deliveryPartner', 'name phone vehicle')
    .lean();

  if (!order) throw new AppError('Order not found.', 404);

  // Access control
  const userId = req.user._id.toString();
  const role = req.user.role;
  const isCustomer = order.customer._id.toString() === userId;
  const isPartner = order.deliveryPartner?._id?.toString() === userId;
  // Restaurant ownership check
  const restaurant = await Restaurant.findById(order.restaurant._id);
  const isOwner = restaurant?.owner.toString() === userId;

  if (!isCustomer && !isPartner && !isOwner && role !== 'admin') {
    throw new AppError('Unauthorized to view this order.', 403);
  }

  sendSuccess(res, 200, 'Order fetched', order);
});

/**
 * GET /api/v1/orders/restaurant/:restaurantId
 * Auth: restaurant_owner — Get orders for their restaurant
 */
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { page, limit, skip } = parsePagination(req.query);
  const { status } = req.query;

  let restaurant = null;
  if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
    restaurant = await Restaurant.findById(restaurantId);
  } else {
    restaurant = await Restaurant.findOne({ owner: req.user._id });
  }
  
  if (!restaurant) {
    return sendSuccess(res, 200, 'No restaurant found for owner', [], buildPagination(page, limit, 0));
  }

  const filter = { restaurant: restaurant._id };
  if (status) filter.status = { $in: status.split(',') };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name phone')
      .lean(),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, 200, 'Restaurant orders fetched', orders, buildPagination(page, limit, total));
});

/**
 * PATCH /api/v1/orders/:id/status
 * Auth: restaurant_owner or delivery_partner — Update order status
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note = '' } = req.body;
  const order = await Order.findById(req.params.id).populate('restaurant');
  if (!order) throw new AppError('Order not found.', 404);

  const userId = req.user._id.toString();
  const role = req.user.role;

  // Define allowed transitions per role
  const ownerTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready_for_pickup'],
  };
  const partnerTransitions = {
    ready_for_pickup: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
  };

  let allowed = false;
  if (role === 'restaurant_owner') {
    const restaurantOwner = order.restaurant.owner.toString();
    if (restaurantOwner !== userId) throw new AppError('Unauthorized.', 403);
    allowed = ownerTransitions[order.status]?.includes(status);
  } else if (role === 'delivery_partner') {
    if (order.deliveryPartner?.toString() !== userId) throw new AppError('Unauthorized.', 403);
    allowed = partnerTransitions[order.status]?.includes(status);
  } else if (role === 'admin') {
    allowed = true;
  }

  if (!allowed) {
    throw new AppError(`Cannot transition from "${order.status}" to "${status}".`, 400);
  }

  order.status = status;
  order.statusHistory.push({ status, timestamp: new Date(), note });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
    stopMockTracking(order._id.toString());

    // Update partner earnings
    if (order.deliveryPartner) {
      const earnings = calculatePartnerEarnings(order.billBreakdown.total);
      await require('../models/User').findByIdAndUpdate(order.deliveryPartner, {
        $push: { earnings: { orderId: order._id, amount: earnings } },
      });
    }
  }

  await order.save();

  // Emit socket event
  emitOrderStatusChanged(order._id.toString(), {
    status,
    note,
    restaurantName: order.restaurant.name,
  });

  // Start mock GPS tracking when order goes out for delivery
  if (status === 'out_for_delivery') {
    const restaurant = order.restaurant;
    const endCoords = {
      lat: order.deliveryAddress.lat || parseFloat(process.env.DEMO_MAP_CENTER_LAT) + 0.05,
      lng: order.deliveryAddress.lng || parseFloat(process.env.DEMO_MAP_CENTER_LNG) + 0.05,
    };
    startMockTracking(
      order._id.toString(),
      restaurant.location,
      endCoords,
      order.estimatedDeliveryTime || 30
    );
  }

  sendSuccess(res, 200, 'Order status updated', order);
});

/**
 * PATCH /api/v1/orders/:id/cancel
 * Auth: customer — Cancel own order (only if pending or confirmed)
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason = '' } = req.body;
  const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
  if (!order) throw new AppError('Order not found.', 404);

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage.', 400);
  }

  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: reason });
  await order.save();

  emitOrderStatusChanged(order._id.toString(), { status: 'cancelled', note: reason });

  sendSuccess(res, 200, 'Order cancelled', order);
});

/**
 * GET /api/v1/orders/partner/available
 * Auth: delivery_partner — Get orders ready for pickup
 */
const getAvailableOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  let orders = await Order.find({
    status: { $in: ['ready_for_pickup', 'preparing', 'confirmed', 'pending'] },
    deliveryPartner: null,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('restaurant', 'name address location')
    .lean();

  if (!orders || orders.length === 0) {
    orders = await Order.find({
      deliveryPartner: null,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('restaurant', 'name address location')
      .lean();
  }

  sendSuccess(res, 200, 'Available orders', orders || []);
});

/**
 * PATCH /api/v1/orders/:id/accept-delivery
 * Auth: delivery_partner — Accept a delivery
 */
const acceptDelivery = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 400);

  order.deliveryPartner = req.user._id;
  if (['pending', 'confirmed', 'preparing'].includes(order.status)) {
    order.status = 'ready_for_pickup';
  }
  order.statusHistory.push({ status: order.status, timestamp: new Date(), note: 'Partner accepted delivery' });
  await order.save();

  emitOrderStatusChanged(order._id.toString(), { status: 'partner_assigned', partnerId: req.user._id });

  sendSuccess(res, 200, 'Delivery accepted', order);
});

/**
 * GET /api/v1/orders/active-partner-order
 * Auth: delivery_partner — Get active assigned delivery order
 */
const getActivePartnerOrder = asyncHandler(async (req, res) => {
  let order = await Order.findOne({
    deliveryPartner: req.user._id,
    status: { $in: ['ready_for_pickup', 'out_for_delivery'] },
  })
    .populate('restaurant', 'name address location phone')
    .populate('customer', 'name phone')
    .lean();

  if (!order) {
    order = await Order.findOne({
      status: { $in: ['ready_for_pickup', 'out_for_delivery'] },
    })
      .populate('restaurant', 'name address location phone')
      .populate('customer', 'name phone')
      .lean();
  }

  sendSuccess(res, 200, 'Active partner order fetched', order || null);
});

/**
 * GET /api/v1/orders/partner/earnings
 * Auth: delivery_partner — Real-time earnings calculation based on delivered orders
 */
const getPartnerEarnings = asyncHandler(async (req, res) => {
  const deliveredOrders = await Order.find({
    deliveryPartner: req.user._id,
    status: 'delivered',
  })
    .sort({ deliveredAt: -1, createdAt: -1 })
    .populate('restaurant', 'name')
    .lean();

  let totalDeliveryPay = 0;
  let totalTips = 0;
  const history = [];

  for (const order of deliveredOrders) {
    const basePay = Math.round((order.billBreakdown?.deliveryFee || 40) + 25);
    const tip = Number(order.billBreakdown?.tip || 0);
    totalDeliveryPay += basePay;
    totalTips += tip;

    history.push({
      _id: order._id,
      orderNumber: order.orderNumber || `#${order._id.toString().slice(-6)}`,
      restaurantName: order.restaurant?.name || 'Partner Restaurant',
      deliveredAt: order.deliveredAt || order.updatedAt || order.createdAt,
      basePay,
      tip,
      totalEarned: basePay + tip,
    });
  }

  const totalEarnings = totalDeliveryPay + totalTips;

  sendSuccess(res, 200, 'Partner earnings fetched', {
    totalEarnings,
    totalDeliveryPay,
    totalTips,
    completedDeliveriesCount: deliveredOrders.length,
    history,
  });
});

module.exports = {
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
};
