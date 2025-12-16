const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Images
  images: [{ type: String }],
  thumbnail: String,
  
  // Auction details
  startPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  minIncrement: { type: Number, default: 1000 },
  buyNowPrice: { type: Number },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'active', 'sold', 'unsold', 'cancelled'],
    default: 'pending'
  },
  
  // Time
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  autoExtendEnabled: { type: Boolean, default: true },
  autoExtendMinutes: { type: Number, default: 5 },
  
  // Condition
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair'], required: true },
  
  // Stats
  viewCount: { type: Number, default: 0 },
  bidCount: { type: Number, default: 0 },
  watchCount: { type: Number, default: 0 },
  
  // Winner
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalPrice: Number,
  
  // Seller notes
  location: String,
  shippingCost: { type: Number, default: 0 },
  shippingMethod: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
  this.slug = this.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);