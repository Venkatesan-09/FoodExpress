const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'pending',        // placed, awaiting restaurant confirmation
  'confirmed',      // restaurant confirmed
  'preparing',      // kitchen is preparing
  'ready_for_pickup', // ready, awaiting delivery partner
  'out_for_delivery', // delivery partner picked up
  'delivered',      // successfully delivered
  'cancelled',      // cancelled (by customer, restaurant, or system)
  'failed',         // payment failed
];

const itemCustomizationSchema = new mongoose.Schema(
  {
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    variantName: { type: String, default: '' },
    addOnIds: [{ type: mongoose.Schema.Types.ObjectId }],
    addOnNames: [{ type: String }],
    addOnPrices: [{ type: Number }],
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },       // snapshot at time of order
    image: { type: String, default: '' },
    basePrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    customizations: { type: itemCustomizationSchema, default: {} },
    effectivePrice: { type: Number, required: true }, // price after variant + add-ons
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const billBreakdownSchema = new mongoose.Schema(
  {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 40 },
    taxes: { type: Number, default: 0 },        // GST etc (mocked at 5%)
    discount: { type: Number, default: 0 },     // from coupon
    tip: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: { type: String, enum: ['card', 'upi', 'cod'], required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String, default: null }, // fake TXN_MOCK_xxx
    chargedAt: { type: Date, default: null },
    cardLast4: { type: String, default: null },    // last 4 digits only
    upiId: { type: String, default: null },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: { type: String },
    phone: { type: String },
    line1: { type: String },
    line2: { type: String, default: '' },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true }, // e.g. FE-20240808-0001
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [orderItemSchema],
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    statusHistory: [statusHistorySchema],
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    billBreakdown: { type: billBreakdownSchema, required: true },
    payment: { type: paymentSchema, required: true },
    coupon: {
      code: { type: String, default: null },
      discountAmount: { type: Number, default: 0 },
    },
    estimatedDeliveryTime: { type: Number, default: 30 }, // minutes from placement
    estimatedDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancellationReason: { type: String, default: '' },
    specialInstructions: { type: String, default: '' },
    isRated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments();
    this.orderNumber = `FE-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
