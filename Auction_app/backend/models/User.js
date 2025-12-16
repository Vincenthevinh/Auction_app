const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  avatar: { type: String, default: null },
  address: String,
  city: String,
  country: String,
  bankAccount: String,
  role: { 
    type: String, 
    enum: ['guest', 'bidder', 'seller', 'admin'], 
    default: 'bidder' 
  },
  emailVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpires: Date,
  
  // Seller info
  shopName: String,
  shopDescription: String,
  sellerRating: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  // Stats
  totalBids: { type: Number, default: 0 },
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);