const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 }, // % or flat amount in INR
    maxDiscount: { type: Number, default: null }, // cap for percentage discounts
    minOrderValue: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    scope: {
      type: String,
      enum: ['global', 'restaurant'],
      default: 'global',
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null, // only if scope === 'restaurant'
    },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, expiryDate: 1 });

// Virtual: isExpired
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// Virtual: isValid (active + not expired + usage not exceeded)
couponSchema.virtual('isValid').get(function () {
  return (
    this.isActive &&
    !this.isExpired &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

couponSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Coupon', couponSchema);
