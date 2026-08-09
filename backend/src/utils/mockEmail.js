const MockEmail = require('../models/MockEmail');

/**
 * Mock email sender — stores emails in MongoDB instead of sending real ones
 * MOCKED: replace with Nodemailer + real SMTP / SendGrid / Resend integration
 */
const sendMockEmail = async ({ to, subject, type = 'other', bodyText = '', bodyHtml = '', metadata = {} }) => {
  try {
    const email = await MockEmail.create({
      to,
      subject,
      type,
      bodyText,
      bodyHtml,
      metadata,
    });
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | ID: ${email._id}`);
    if (metadata.resetLink) {
      console.log(`[MOCK EMAIL] Password Reset Link: ${metadata.resetLink}`);
    }
    return email;
  } catch (err) {
    console.error('[MOCK EMAIL] Failed to save mock email:', err.message);
    // Don't throw — email failure shouldn't break the main flow
  }
};

/**
 * Send password reset mock email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendMockEmail({
    to: user.email,
    subject: 'FoodExpress — Reset Your Password',
    type: 'password_reset',
    bodyText: `Click this link to reset your password (valid for 1 hour): ${resetLink}`,
    bodyHtml: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #ea580c; font-size: 24px; margin-bottom: 16px;">Reset Your Password</h2>
        <p style="color: #57534e; margin-bottom: 24px;">
          You requested a password reset for your FoodExpress account. Click the button below to set a new password.
          This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetLink}" 
           style="display: inline-block; background: #ea580c; color: white; padding: 14px 28px; 
                  border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
        <p style="color: #a8a29e; font-size: 12px; margin-top: 32px;">
          If you didn't request this, ignore this email. Your password won't change.
        </p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;" />
        <p style="color: #a8a29e; font-size: 12px;">
          Can't click the button? Copy this link: <br/>
          <span style="color: #ea580c;">${resetLink}</span>
        </p>
      </div>
    `,
    metadata: { resetLink, userId: user._id.toString() },
  });
};

/**
 * Send welcome mock email
 */
const sendWelcomeEmail = async (user) => {
  await sendMockEmail({
    to: user.email,
    subject: `Welcome to FoodExpress, ${user.name}! 🍕`,
    type: 'welcome',
    bodyText: `Welcome to FoodExpress! Your account has been created successfully.`,
    bodyHtml: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #ea580c;">Welcome to FoodExpress! 🍕</h2>
        <p style="color: #57534e;">Hi ${user.name}, your account is ready. Order amazing food now!</p>
      </div>
    `,
    metadata: { userId: user._id.toString() },
  });
};

module.exports = { sendMockEmail, sendPasswordResetEmail, sendWelcomeEmail };
