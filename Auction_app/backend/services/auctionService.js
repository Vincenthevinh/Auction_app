const Product = require('../models/Product');
const Bid = require('../models/Bid');
const Watchlist = require('../models/Watchlist');

const auctionService = {
  // Đặt bid
  async placeBid(productId, bidderId, amount, isAutoBid = false) {
    const product = await Product.findById(productId);
    
    if (!product || product.status !== 'active') {
      throw new Error('Product is not available');
    }
    
    const now = new Date();
    if (now > product.endTime) {
      throw new Error('Auction has ended');
    }
    
    // Validate bid amount
    const minBidAmount = Math.max(product.currentPrice + product.minIncrement, product.startPrice);
    if (amount < minBidAmount) {
      throw new Error(`Bid must be at least ${minBidAmount}`);
    }
    
    // Check max price nếu buy now có
    if (product.buyNowPrice && amount >= product.buyNowPrice) {
      product.status = 'sold';
      product.winnerId = bidderId;
      product.finalPrice = product.buyNowPrice;
      await product.save();
      return { message: 'Item sold at buy now price', product };
    }
    
    // Tự động gia hạn nếu bid gần kết thúc
    if (product.autoExtendEnabled) {
      const timeToEnd = product.endTime - now;
      if (timeToEnd < 5 * 60 * 1000) { // 5 phút
        product.endTime = new Date(now.getTime() + product.autoExtendMinutes * 60 * 1000);
      }
    }
    
    // Lưu bid
    const bid = new Bid({
      product: productId,
      bidder: bidderId,
      amount,
      isAutoBid
    });
    await bid.save();
    
    // Cập nhật giá hiện tại
    product.currentPrice = amount;
    product.bidCount += 1;
    await product.save();
    
    return { message: 'Bid placed successfully', bid };
  },
  
  // Thêm vào watchlist
  async addToWatchlist(userId, productId) {
    const watchlist = new Watchlist({
      user: userId,
      product: productId
    });
    await watchlist.save();
    
    await Product.findByIdAndUpdate(productId, { $inc: { watchCount: 1 } });
    return { message: 'Added to watchlist' };
  },
  
  // Xóa khỏi watchlist
  async removeFromWatchlist(userId, productId) {
    await Watchlist.deleteOne({ user: userId, product: productId });
    await Product.findByIdAndUpdate(productId, { $inc: { watchCount: -1 } });
    return { message: 'Removed from watchlist' };
  },
  
  // Lấy watchlist
  async getWatchlist(userId, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const total = await Watchlist.countDocuments({ user: userId });
    const items = await Watchlist.find({ user: userId })
      .populate('product')
      .skip(skip)
      .limit(limit)
      .sort({ addedAt: -1 });
    
    return {
      items: items.map(w => w.product),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }
};

module.exports = auctionService;