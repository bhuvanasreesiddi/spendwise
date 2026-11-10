const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { seedDefaultCategories } = require('../utils/seedCategories');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'spendwise_super_secure_jwt_secret_key_2026_change_in_production', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, currency = 'USD' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      currency,
    });

    // Seed default categories for new user
    await seedDefaultCategories(user._id);

    const token = generateToken(user._id);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const safeUser = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      currency: req.user.currency,
      createdAt: req.user.createdAt,
    };

    res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, currency } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (currency) user.currency = currency;

    await user.save();

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
