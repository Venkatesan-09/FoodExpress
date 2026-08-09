const Order = require('../models/Order');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { processMockPayment } = require('../utils/mockPayment');

/**
 * POST /api/v1/payments/mock-charge
 * Auth: customer — Process mock payment for an order
 * MOCKED: replace with Razorpay/Stripe integration
 */
const mockCharge = asyncHandler(async (req, res) => {
  const { orderId, method, cardNumber, cardExpiry, cardCvv, upiId } = req.body;

  const order = await Order.findOne({ _id: orderId, customer: req.user._id });
  if (!order) throw new AppError('Order not found.', 404);
  if (order.payment.status === 'success') {
    throw new AppError('Payment already processed for this order.', 400);
  }
  if (order.status === 'cancelled') {
    throw new AppError('Cannot pay for a cancelled order.', 400);
  }

  // Extract last 4 of card for storage (never store full card number)
  const cardLast4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : null;

  // MOCKED: Process payment simulation
  const paymentResult = await processMockPayment({
    method,
    amount: order.billBreakdown.total,
    cardLast4,
    upiId,
  });

  if (!paymentResult.success) {
    // Update payment status to failed
    order.payment.status = 'failed';
    await order.save();

    return res.status(402).json({
      success: false,
      message: paymentResult.error,
      data: { status: 'failed', errorCode: paymentResult.errorCode },
    });
  }

  // Update order payment
  order.payment.status = 'success';
  order.payment.transactionId = paymentResult.transactionId;
  order.payment.chargedAt = paymentResult.chargedAt;
  order.payment.cardLast4 = paymentResult.cardLast4;
  order.payment.upiId = paymentResult.upiId;
  await order.save();

  sendSuccess(res, 200, 'Payment successful', {
    status: 'success',
    transactionId: paymentResult.transactionId,
    amount: order.billBreakdown.total,
    method,
    chargedAt: paymentResult.chargedAt,
  });
});

/**
 * GET /api/v1/payments/order/:orderId
 * Auth: customer — Get payment details for an order
 */
const getPaymentDetails = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    customer: req.user._id,
  }).select('payment billBreakdown orderNumber');

  if (!order) throw new AppError('Order not found.', 404);

  sendSuccess(res, 200, 'Payment details', {
    orderNumber: order.orderNumber,
    payment: order.payment,
    total: order.billBreakdown.total,
  });
});

module.exports = { mockCharge, getPaymentDetails };
