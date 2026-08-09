const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    restaurantRating: { type: Number, required: true, min: 1, max: 5 },
    restaurantComment: { type: String, default: '', maxlength: 500 },
    deliveryRating: { type: Number, default: null, min: 1, max: 5 },
    deliveryComment: { type: String, default: '', maxlength: 300 },
    images: [{ type: String }], // optional review photos (Cloudinary)
    isVisible: { type: Boolean, default: true }, // admin can hide
  },
  { timestamps: true }
);

reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });

// After save: update restaurant rating avg
reviewSchema.post('save', async function () {
  const Restaurant = mongoose.model('Restaurant');
  const stats = await this.constructor.aggregate([
    { $match: { restaurant: this.restaurant, isVisible: true } },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$restaurantRating' },
        count: { $sum: 1 },
      },
    },
  ]);
  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(this.restaurant, {
      'rating.avg': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
