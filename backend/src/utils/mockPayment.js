const { v4: uuidv4 } = require('uuid');

/**
 * Mock payment processor
 * MOCKED: replace with Razorpay/Stripe/PayU integration
 */

/**
 * Simulate a payment charge
 * Returns success ~95% of the time with a fake transaction ID
 * @param {Object} params
 * @param {string} params.method - 'card' | 'upi' | 'cod'
 * @param {number} params.amount - Amount in INR
 * @param {string} [params.cardLast4] - Last 4 digits of card (for card payments)
 * @param {string} [params.upiId] - UPI ID (for UPI payments)
 */
const processMockPayment = async ({ method, amount, cardLast4, upiId }) => {
  // MOCKED: random 2–3 second processing delay
  const delay = Math.floor(Math.random() * 1000) + 2000; // 2000–3000ms
  await new Promise((resolve) => setTimeout(resolve, delay));

  // MOCKED: ~95% success rate
  const isSuccess = Math.random() < 0.95;

  if (!isSuccess) {
    return {
      success: false,
      status: 'failed',
      transactionId: null,
      error: 'Payment declined by bank. Please try again or use a different method.',
      errorCode: 'PAYMENT_DECLINED',
    };
  }

  // Generate fake transaction ID
  // MOCKED: replace with real gateway transaction reference
  const transactionId = `TXN_MOCK_${uuidv4().split('-')[0].toUpperCase()}_${Date.now()}`;

  return {
    success: true,
    status: 'success',
    transactionId,
    chargedAt: new Date(),
    method,
    amount,
    cardLast4: cardLast4 || null,
    upiId: upiId || null,
    gatewayReference: `GW_REF_${uuidv4().split('-')[0].toUpperCase()}`, // MOCKED
    message: 'Payment successful',
  };
};

/**
 * Calculate delivery fee based on distance (mocked — uses fixed tiers)
 * MOCKED: replace with real distance-based calculation
 * @param {number} distanceKm - Distance in km
 * @returns {number} - Delivery fee in INR
 */
const calculateDeliveryFee = (distanceKm = 5) => {
  // MOCKED: flat fees by distance range
  if (distanceKm <= 2) return 20;
  if (distanceKm <= 5) return 40;
  if (distanceKm <= 10) return 60;
  return 80;
};

/**
 * Calculate partner earnings for a delivery (mocked)
 * MOCKED: replace with real earnings policy
 * @param {number} orderTotal
 * @param {number} distanceKm
 * @returns {number}
 */
const calculatePartnerEarnings = (orderTotal, distanceKm = 5) => {
  // MOCKED: base ₹30 + ₹5 per km + 2% of order value
  return Math.round(30 + distanceKm * 5 + orderTotal * 0.02);
};

/**
 * Calculate taxes on order subtotal (mocked GST)
 * @param {number} subtotal
 * @returns {number}
 */
const calculateTaxes = (subtotal) => {
  // MOCKED: 5% GST flat rate
  return Math.round(subtotal * 0.05);
};

module.exports = {
  processMockPayment,
  calculateDeliveryFee,
  calculatePartnerEarnings,
  calculateTaxes,
};
