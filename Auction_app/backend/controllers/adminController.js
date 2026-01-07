const User = require('../models/User');
const Category = require('../models/Category');
const SellerRequest = require('../models/SellerRequest');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Get all seller requests
exports.getSellerRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const requests = await SellerRequest.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// Approve seller request
exports.approveSellerRequest = async (req, res, next) => {
  try {
    const request = await SellerRequest.findById(req.params.id)
      .populate('user');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Update user role
    await User.findByIdAndUpdate(request.user._id, {
      role: 'seller',
      shopName: request.shopName,
      shopDescription: request.shopDescription
    });
    
    // Update request
    request.status = 'approved';
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    await request.save();
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: request.user.email,
      subject: 'Seller Account Approved - AuctionHub',
      html: `
        <h2>Congratulations!</h2>
        <p>Your seller account request has been approved.</p>
        <p>You can now start listing your products on AuctionHub.</p>
      `
    });
    
    res.json({ message: 'Request approved', request });
  } catch (error) {
    next(error);
  }
};

// Reject seller request
exports.rejectSellerRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await SellerRequest.findById(req.params.id)
      .populate('user');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    request.status = 'rejected';
    request.rejectionReason = reason;
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    await request.save();
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: request.user.email,
      subject: 'Seller Account Request Update - AuctionHub',
      html: `
        <h2>Seller Request Update</h2>
        <p>Unfortunately, your seller account request has been rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You can submit a new request after addressing the issues.</p>
      `
    });
    
    res.json({ message: 'Request rejected', request });
  } catch (error) {
    next(error);
  }
};

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password -otpCode')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Reset user password
exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate random password
    const newPassword = crypto.randomBytes(8).toString('hex');
    user.password = newPassword;
    await user.save();
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset - AuctionHub',
      html: `
        <h2>Password Reset</h2>
        <p>Your password has been reset by an administrator.</p>
        <p><strong>New Password:</strong> ${newPassword}</p>
        <p>Please change your password after logging in.</p>
      `
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// Category management
exports.createCategory = async (req, res, next) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};