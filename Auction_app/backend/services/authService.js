const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Cấu hình transporter Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}); 

// Test email connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Service Error:', error.message);
  } else {
    console.log('✅ Email Service Ready');
  }
});

const authService = {
  // Đăng ký user
  async register(userData) {
    const { name, email, password, confirmPassword } = userData;

    // Validation
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user (NOT verified yet)
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        otpCode: otp,
        otpExpires,
        emailVerified: false
      });

      // Save user to database
      await user.save();
      console.log('✅ User created:', email);

      // Try to send OTP email
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Verify Your Email - AuctionHub',
          html: `
            <h2>Welcome to AuctionHub!</h2>
            <p>Your email verification code is:</p>
            <h1 style="color: #ff6b35; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ OTP Email sent to:', email);

        return {
          success: true,
          userId: user._id,
          message: 'Registration successful! OTP sent to your email.',
          debug: `OTP: ${otp}` // Remove in production
        };
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message);
        
        // If email fails, still return success but inform user
        // They can request OTP resend
        return {
          success: true,
          userId: user._id,
          message: 'Registration successful! However, email failed to send. Please try resend OTP.',
          warning: emailError.message,
          debug: `OTP: ${otp}` // For testing - remove in production
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      throw error;
    }
  },

  // Xác nhận OTP
  async verifyOTP(userId, otp) {
    try {
      // Find user
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email already verified');
      }

      // Check OTP validity
      if (!user.otpCode || user.otpCode !== otp.toString()) {
        throw new Error('Invalid OTP code');
      }

      // Check OTP expiration
      if (new Date() > user.otpExpires) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      // Mark email as verified
      user.emailVerified = true;
      user.otpCode = null;
      user.otpExpires = null;
      await user.save();

      console.log('✅ Email verified:', user.email);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      return {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: 'Email verified successfully!'
      };
    } catch (error) {
      console.error('❌ OTP verification error:', error.message);
      throw error;
    }
  },

  // Resend OTP
  async resendOTP(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email already verified');
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send OTP email
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'Your New Verification Code - AuctionHub',
          html: `
            <h2>New Verification Code</h2>
            <p>Your new email verification code is:</p>
            <h1 style="color: #ff6b35; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ OTP Resent to:', user.email);

        return {
          success: true,
          message: 'New OTP sent to your email',
          debug: `OTP: ${otp}` // Remove in production
        };
      } catch (emailError) {
        console.error('❌ Resend email failed:', emailError.message);
        throw new Error('Failed to send OTP email. Please try again later.');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error.message);
      throw error;
    }
  },

  // Đăng nhập
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // If email not verified, send OTP
      if (!user.emailVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Verify Your Email - AuctionHub',
            html: `
              <h2>Email Verification Required</h2>
              <p>Please verify your email to complete login:</p>
              <h1 style="color: #ff6b35; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            `
          };

          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          console.error('❌ Email send failed:', emailError.message);
        }

        return {
          success: false,
          message: 'Please verify your email first. OTP sent to your email.',
          userId: user._id,
          requiresOTP: true,
          debug: `OTP: ${otp}` // Remove in production
        };
      }

      // Generate token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      console.log('✅ Login successful:', email);

      return {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: 'Login successful!'
      };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('❌ Get user error:', error.message);
      throw error;
    }
  }
};

module.exports = authService;