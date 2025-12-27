const Bid = require('../models/Bid');
const Watchlist = require('../models/Watchlist');
const auctionService = require('../services/auctionService');

// Place bid
exports.placeBid = async (req, res, next) => {
  try {
    const result = await auctionService.placeBid(
      req.params.productId,
      req.user.userId,
      parseFloat(req.body.amount)
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get bid history
exports.getBidHistory = async (req, res, next) => {
  try {
    const bids = await Bid.find({ product: req.params.productId })
      .populate('bidder', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(bids);
  } catch (error) {
    next(error);
  }
};

// Add to watchlist
exports.addToWatchlist = async (req, res, next) => {
  try {
    const result = await auctionService.addToWatchlist(
      req.user.userId,
      req.params.productId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Remove from watchlist
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const result = await auctionService.removeFromWatchlist(
      req.user.userId,
      req.params.productId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get user watchlist
exports.getWatchlist = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const result = await auctionService.getWatchlist(
      req.user.userId,
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.placeAutoBid = async (req, res, next) => {
  try {
    const { maxAmount } = req.body;
    const result = await auctionService.placeBid(
      req.params.productId,
      req.user.userId,
      parseFloat(req.body.amount),
      true, 
      parseFloat(maxAmount)
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};