const mongoose = require('mongoose');
const bidSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['active', 'overbid', 'won', 'lost'],
    default: 'active'
  },
  isAutoBid: { type: Boolean, default: false },
  maxBidAmount: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bid', bidSchema);