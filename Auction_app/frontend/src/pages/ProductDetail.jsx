import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetail } from '../redux/slices/productSlice';
import { fetchBidHistory, placeBid, addToWatchlist } from '../redux/slices/auctionSlice';
import { showNotification } from '../redux/slices/uiSlice';
import ImageGallery from '../components/ImageGallery';
import BidHistory from '../components/BidHistory';
import SellerInfo from '../components/SellerInfo';
import { formatPrice, formatDate, calculateTimeRemaining, validateBidAmount } from '../utils/helpers';
import { Heart, Share2, MapPin, Truck, AlertCircle } from 'lucide-react';
import '../styles/ProductDetail.css';
import { isProductEnding } from '../utils/helpers';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { detail: product, loading } = useSelector(state => state.products);
  const { bidHistory } = useSelector(state => state.auction);
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const [bidAmount, setBidAmount] = useState('');
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetail(id));
    dispatch(fetchBidHistory(id));
  }, [id, dispatch]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      dispatch(showNotification({
        type: 'error',
        message: 'Please enter a valid bid amount'
      }));
      return;
    }

    const error = validateBidAmount(
      product.currentPrice,
      product.minIncrement,
      parseFloat(bidAmount)
    );

    if (error) {
      dispatch(showNotification({ type: 'error', message: error }));
      return;
    }

    try {
      setBiddingLoading(true);
      const result = await dispatch(placeBid({
        productId: id,
        amount: parseFloat(bidAmount)
      }));

      if (result.payload) {
        dispatch(showNotification({
          type: 'success',
          message: 'Bid placed successfully!'
        }));
        setBidAmount('');
        dispatch(fetchBidHistory(id));
      }
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: error.message
      }));
    } finally {
      setBiddingLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToWatchlist(id));
      setIsWatched(true);
      dispatch(showNotification({
        type: 'success',
        message: 'Added to watchlist'
      }));
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: error.message
      }));
    }
  };

  if (loading || !product) {
    return <div className="loading">Loading...</div>;
  }

  const minBidAmount = Math.max(
    product.currentPrice + product.minIncrement,
    product.startPrice
  );

  return (
    <div className="product-detail">
      <div className="container">
        <div className="detail-grid">
          {/* Left Column - Images & Info */}
          <div className="detail-left">
            <ImageGallery images={product.images} />

            {/* Product Info */}
            <div className="product-description">
              <h2>Product Details</h2>
              <div className="detail-section">
                <div className="detail-row">
                  <span className="label">Condition:</span>
                  <span className="value">{product.condition}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">
                    <MapPin size={14} /> {product.location}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Shipping:</span>
                  <span className="value">
                    <Truck size={14} /> {formatPrice(product.shippingCost)}
                  </span>
                </div>
              </div>

              <div className="description-text">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>
            </div>

            {/* Bid History */}
            <BidHistory bids={bidHistory} />
          </div>

          {/* Right Column - Bidding & Seller */}
          <div className="detail-right">
            {/* Auction Info Card */}
            <div className="auction-card">
              <h1>{product.title}</h1>

              <div className="current-price-section">
                <span className="label">Current Price</span>
                <span className="price">{formatPrice(product.currentPrice)}</span>
              </div>

              <div className="auction-details">
                <div className="detail-item">
                  <span className="detail-label">Bids</span>
                  <span className="detail-value">{product.bidCount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time Remaining</span>
                  <span className={`detail-value ${isProductEnding(product.endTime) ? 'urgent' : ''}`}>
                    {calculateTimeRemaining(product.endTime)}
                  </span>
                </div>
              </div>

              {/* Bid Form */}
              <form onSubmit={handlePlaceBid} className="bid-form">
                <div className="form-group">
                  <label>Your Bid Amount</label>
                  <div className="bid-input-group">
                    <span className="currency">₫</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={minBidAmount.toString()}
                      min={minBidAmount}
                      step={product.minIncrement}
                      disabled={biddingLoading}
                    />
                  </div>
                  <small>Minimum: {formatPrice(minBidAmount)}</small>
                </div>

                <button
                  type="submit"
                  disabled={biddingLoading || !isAuthenticated}
                  className="btn btn-primary btn-block"
                >
                  {biddingLoading ? 'Placing Bid...' : 'Place Bid'}
                </button>
              </form>

              {product.buyNowPrice && (
                <button className="btn btn-secondary btn-block">
                  Buy Now - {formatPrice(product.buyNowPrice)}
                </button>
              )}

              <button
                onClick={handleAddToWatchlist}
                className={`btn-wishlist-full ${isWatched ? 'active' : ''}`}
              >
                <Heart size={20} />
                {isWatched ? 'Saved to Watchlist' : 'Add to Watchlist'}
              </button>

              <button className="btn-share">
                <Share2 size={18} /> Share
              </button>

              {/* Time Warning */}
              {isProductEnding(product.endTime) && (
                <div className="warning-box">
                  <AlertCircle size={18} />
                  <p>This auction is ending soon. Place your bid now!</p>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <SellerInfo seller={product.seller} />

            {/* Shipping Info */}
            <div className="shipping-card">
              <h3>Shipping Information</h3>
              <div className="shipping-details">
                <p><strong>Method:</strong> {product.shippingMethod}</p>
                <p><strong>Cost:</strong> {formatPrice(product.shippingCost)}</p>
                <p><strong>Delivery Time:</strong> 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}