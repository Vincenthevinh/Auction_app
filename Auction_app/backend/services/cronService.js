const cron = require('node-cron');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const User = require('../models/User');
const notificationService = require('./notificationService');

class CronService {
  start() {
    // Check ending auctions every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.closeExpiredAuctions();
      } catch (error) {
        console.error('Cron job error:', error);
      }
    });
    
    // Send "ending soon" notifications every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.sendEndingSoonNotifications();
      } catch (error) {
        console.error('Ending soon notification error:', error);
      }
    });
    
    console.log('✅ Cron jobs started');
  }
  
  async closeExpiredAuctions() {
    const now = new Date();
    
    const expiredAuctions = await Product.find({
      status: 'active',
      endTime: { $lte: now }
    });
    
    for (const product of expiredAuctions) {
      // Find winning bid
      const winningBid = await Bid.findOne({
        product: product._id,
        status: 'active'
      }).sort({ amount: -1 }).populate('bidder');
      
      if (winningBid) {
        // Mark as sold
        product.status = 'sold';
        product.winnerId = winningBid.bidder._id;
        product.finalPrice = winningBid.amount;
        await product.save();
        
        // Update bid status
        winningBid.status = 'won';
        await winningBid.save();
        
        // Mark other bids as lost
        await Bid.updateMany(
          { 
            product: product._id, 
            _id: { $ne: winningBid._id },
            status: { $in: ['active', 'overbid'] }
          },
          { status: 'lost' }
        );
        
        // Update seller stats
        await User.findByIdAndUpdate(product.seller, {
          $inc: { 
            totalSold: 1,
            totalRevenue: winningBid.amount
          }
        });
        
        // Update winner stats
        await User.findByIdAndUpdate(winningBid.bidder._id, {
          $inc: { totalWins: 1 }
        });
        
        // Send notifications
        await notificationService.createNotification({
          recipient: winningBid.bidder._id,
          type: 'auction_won',
          title: 'Congratulations! You won an auction',
          message: `You won the auction for ${product.title} at ${winningBid.amount}`,
          relatedProduct: product._id,
          relatedBid: winningBid._id
        });
        
        await notificationService.createNotification({
          recipient: product.seller,
          type: 'payment_received',
          title: 'Your item has been sold',
          message: `${product.title} sold for ${winningBid.amount}`,
          relatedProduct: product._id
        });
        
        console.log(`✅ Closed auction: ${product.title}`);
      } else {
        // No bids, mark as unsold
        product.status = 'unsold';
        await product.save();
        console.log(`⚠️ Auction ended with no bids: ${product.title}`);
      }
    }
  }
  
  async sendEndingSoonNotifications() {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    
    const endingSoonProducts = await Product.find({
      status: 'active',
      endTime: { 
        $gte: new Date(),
        $lte: oneHourFromNow
      }
    });
    
    for (const product of endingSoonProducts) {
      // Find all active bidders
      const bids = await Bid.find({
        product: product._id
      }).distinct('bidder');
      
      for (const bidderId of bids) {
        // Check if notification already sent
        const existingNotif = await notificationService.getUserNotifications(bidderId, 100);
        const alreadySent = existingNotif.some(n => 
          n.type === 'auction_ending' && 
          n.relatedProduct?._id?.toString() === product._id.toString()
        );
        
        if (!alreadySent) {
          await notificationService.createNotification({
            recipient: bidderId,
            type: 'auction_ending',
            title: 'Auction ending soon',
            message: `${product.title} ends in less than 1 hour!`,
            relatedProduct: product._id
          });
        }
      }
    }
  }
}

module.exports = new CronService();