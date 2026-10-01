const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, 
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification token (valid for 24 hours)
userSchema.methods.createEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.verificationTokenHash = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  return rawToken;
};

module.exports = mongoose.model('User', userSchema);