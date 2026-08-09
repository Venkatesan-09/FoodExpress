const mongoose = require('mongoose');

// Stores mock emails instead of sending real ones
// Viewable via Admin panel → Settings → Mock Inbox
const mockEmailSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    type: {
      type: String,
      enum: ['password_reset', 'welcome', 'order_confirmation', 'other'],
      default: 'other',
    },
    bodyText: { type: String, default: '' },
    bodyHtml: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { resetLink, orderId }
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

mockEmailSchema.index({ to: 1, createdAt: -1 });
mockEmailSchema.index({ read: 1 });

module.exports = mongoose.model('MockEmail', mockEmailSchema);
