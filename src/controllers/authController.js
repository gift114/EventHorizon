const bcrypt = require('bcrypt');
const User = require('../models/User');
const {
  generateAuthToken,
  hashToken,
} = require('../Utils/generateToken');
const { sendVerificationEmail } = require('../hashing/sendEmail');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user?.isVerified) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const isResendingVerification = Boolean(user);
    if (!user) {
      user = new User({ name, email, password });
    }

    const rawToken = user.createEmailVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail({ to: user.email, name: user.name, rawToken });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Verification email could not be sent. Please try again later.',
      });
    }

    return res.status(isResendingVerification ? 200 : 201).json({
      success: true,
      message: isResendingVerification
        ? 'Verification email resent. Please check your inbox.'
        : 'Registration successful. Please check your email to verify your account.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
      });
    }

    const token = generateAuthToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      verificationTokenHash: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    }).select('+verificationTokenHash +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired.',
      });
    }

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error during email verification.',
    });
  }
}

module.exports = { register, login, verifyEmail };
