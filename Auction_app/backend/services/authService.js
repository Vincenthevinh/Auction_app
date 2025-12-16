const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const authService = {
  // Đăng ký user
  async register(userData) {
    const { name, email, password, confirmPassword } = userData;
    
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    const user = new User({
      name,
      email,
      password,
      otpCode: otp.toString(),
      otpExpires
    });
    
    await user.save();
    
    // Gửi OTP email
    await transporter.sendMail({
      to: email,
      subject: 'Xác nhận tài khoản - Auction Website',
      html: `<h2>Mã xác nhận OTP: ${otp}</h2>
             <p>Mã này có hiệu lực trong 10 phút</p>`
    });
    
    return { message: 'OTP sent to email', userId: user._id };
  },
  
  // Xác nhận OTP
  async verifyOTP(userId, otp) {
    const user = await User.findById(userId);
    
    if (!user || user.otpCode !== otp) {
      throw new Error('Invalid OTP');
    }
    
    if (new Date() > user.otpExpires) {
      throw new Error('OTP expired');
    }
    
    user.emailVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    return { token, user: { id: user._id, name: user.name, email: user.email } };
  },
  
  // Đăng nhập
  async login(email, password) {
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.emailVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      user.otpCode = otp.toString();
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      await transporter.sendMail({
        to: email,
        subject: 'OTP Verification',
        html: `<h2>Your OTP: ${otp}</h2>`
      });
      
      return { message: 'Please verify OTP', userId: user._id };
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
  }
};

module.exports = authService;