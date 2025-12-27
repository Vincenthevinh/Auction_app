const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class NotificationService {
  async createNotification(data) {
    const notification = await Notification.create(data);
    
    // Send email if important
    if (['auction_won', 'bid_outbid'].includes(data.type)) {
      await this.sendEmail(notification);
    }
    
    return notification;
  }
  
  async sendEmail(notification) {
    const user = await User.findById(notification.recipient);
    if (!user?.email) return;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: notification.title,
      html: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <a href="${process.env.FRONTEND_URL}">Visit AuctionHub</a>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }
  
  async getUserNotifications(userId, limit = 20) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedProduct', 'title thumbnail');
  }
  
  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }
  
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }
  
  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
  }
}

module.exports = new NotificationService();