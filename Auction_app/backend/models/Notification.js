// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['bid_placed', 'bid_outbid', 'auction_won', 'auction_ending', 'payment_received'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  relatedBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);