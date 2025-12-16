const express = require('express');
const auctionService = require('../services/auctionService');
const { authMiddleware } = require('../middleware/auth');
const Bid = require('../models/Bid');

const router = express.Router();

// Đặt bid
router.post('/:productId/bid', authMiddleware, async (req, res, next) => {
  try {
    const { amount } = req.body;
    const result = await auctionService.placeBid(
      req.params.productId,
      req.user.userId,
      amount
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Lấy lịch sử bid của sản phẩm
router.get('/:productId/bids', async (req, res, next) => {
  try {
    const bids = await Bid.find({ product: req.params.productId })
      .populate('bidder', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(bids);
  } catch (error) {
    next(error);
  }
});

// Thêm vào watchlist
router.post('/:productId/watchlist', authMiddleware, async (req, res, next) => {
  try {
    const result = await auctionService.addToWatchlist(req.user.userId, req.params.productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Xóa khỏi watchlist
router.delete('/:productId/watchlist', authMiddleware, async (req, res, next) => {
  try {
    const result = await auctionService.removeFromWatchlist(req.user.userId, req.params.productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Lấy watchlist của user
router.get('/watchlist/user', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const result = await auctionService.getWatchlist(req.user.userId, page);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;