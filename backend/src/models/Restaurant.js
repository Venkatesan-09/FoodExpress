const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '09:00' }, // HH:MM
    closeTime: { type: String, default: '22:00' }, // HH:MM
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    cuisine: [{ type: String, trim: true }],
    images: [{ type: String }], // Cloudinary URLs
    logo: { type: String, default: '' },
    address: {
      line1: { type: String, required: true },
      line2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    phone: { type: String, default: '' },
    openingHours: [openingHourSchema],
    isOpen: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected', 'suspended'],
      default: 'pending_approval',
    },
    rejectionReason: { type: String, default: '' },
    rating: {
      avg: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    deliveryTime: { type: Number, default: 30 }, // minutes
    minOrderValue: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 40 },
    tags: [{ type: String }], // e.g. 'top rated', 'trending', 'new'
    priceRange: { type: Number, enum: [1, 2, 3, 4], default: 2 }, // $ to $$$$
    isVegOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

restaurantSchema.index({ 'location.lat': 1, 'location.lng': 1 });
restaurantSchema.index({ status: 1, isOpen: 1 });
restaurantSchema.index({ name: 'text', description: 'text', cuisine: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
