const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Small", "Medium", "Large"
    priceModifier: { type: Number, default: 0 }, // added to base price
  },
  { _id: true }
);

const addOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Extra Cheese", "Garlic Bread"
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: true }
);

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' }, // Cloudinary URL
    category: { type: String, required: true, trim: true },
    isVeg: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    variants: [variantSchema],
    addOns: [addOnSchema],
    inStock: { type: Boolean, default: true },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage
    sortOrder: { type: Number, default: 0 }, // for ordering within category
    tags: [{ type: String }], // e.g. 'spicy', 'new', 'popular'
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ restaurant: 1, inStock: 1 });
menuItemSchema.index({ name: 'text', description: 'text', category: 'text' });

// Virtual: discounted price
menuItemSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
