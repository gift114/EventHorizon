const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAuthToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

function generateEmailVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const minutes = parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES, 10) || 30;
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  return { rawToken, hashedToken, expiresAt };
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = {
  generateAuthToken,
  generateEmailVerificationToken,
  hashToken,
};