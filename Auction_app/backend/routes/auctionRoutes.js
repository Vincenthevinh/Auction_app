const express = require('express');
const auctionController = require('../controllers/auctionController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Bidding
router.post('/:productId/bid', authMiddleware, auctionController.placeBid);
router.get('/:productId/bids', auctionController.getBidHistory);
router.post('/:productId/auto-bid', authMiddleware, auctionController.placeAutoBid);

// Watchlist
router.post('/:productId/watchlist', authMiddleware, auctionController.addToWatchlist);
router.delete('/:productId/watchlist', authMiddleware, auctionController.removeFromWatchlist);
router.get('/watchlist/user', authMiddleware, auctionController.getWatchlist);

module.exports = router;