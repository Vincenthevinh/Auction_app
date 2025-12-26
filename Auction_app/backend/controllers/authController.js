const User = require('../models/User');
const authService = require('../services/authService');

// Register user
exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    
    // Return 201 Created
    return res.status(201).json({
      success: result.success,
      userId: result.userId,
      message: result.message,
      warning: result.warning || null,
      debug: process.env.NODE_ENV === 'development' ? result.debug : null
    });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'userId and otp are required'
      });
    }

    const result = await authService.verifyOTP(userId, otp);

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed'
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const result = await authService.resendOTP(userId);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      debug: process.env.NODE_ENV === 'development' ? result.debug : null
    });
  } catch (error) {
    console.error('❌ Resend OTP error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to resend OTP'
    });
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await authService.login(email, password);

    // If requires OTP
    if (!result.success && result.requiresOTP) {
      return res.status(200).json({
        success: false,
        userId: result.userId,
        message: result.message,
        requiresOTP: true,
        debug: process.env.NODE_ENV === 'development' ? result.debug : null
      });
    }

    // If login successful
    if (result.success) {
      return res.status(200).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    return res.status(404).json({
      success: false,
      message: error.message || 'User not found'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, country } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, address, city, country },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};