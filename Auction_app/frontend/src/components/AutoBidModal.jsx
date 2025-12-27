import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../redux/slices/uiSlice';
import api from '../services/api';
import '../styles/AutoBidModal.css';

export default function AutoBidModal({ product, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [startingBid, setStartingBid] = useState('');
  const [maxBid, setMaxBid] = useState('');
  const [loading, setLoading] = useState(false);

  const minBidAmount = Math.max(
    product.currentPrice + product.minIncrement,
    product.startPrice
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startBid = parseFloat(startingBid);
    const maxBidAmount = parseFloat(maxBid);

    // Validation
    if (startBid < minBidAmount) {
      dispatch(showNotification({
        type: 'error',
        message: `Starting bid must be at least ${minBidAmount}`
      }));
      return;
    }

    if (maxBidAmount <= startBid) {
      dispatch(showNotification({
        type: 'error',
        message: 'Maximum bid must be higher than starting bid'
      }));
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auction/${product._id}/auto-bid`, {
        amount: startBid,
        maxAmount: maxBidAmount
      });

      dispatch(showNotification({
        type: 'success',
        message: 'Auto-bid activated successfully!'
      }));

      onSuccess();
      onClose();
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to activate auto-bid'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2>Activate Auto-Bidding</h2>
        
        <div className="info-box">
          <Info size={18} />
          <p>
            Auto-bidding will automatically place bids on your behalf up to your maximum amount. 
            You'll only pay the minimum needed to stay in the lead.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auto-bid-form">
          <div className="form-group">
            <label>Starting Bid (₫)</label>
            <input
              type="number"
              value={startingBid}
              onChange={(e) => setStartingBid(e.target.value)}
              placeholder={minBidAmount.toString()}
              min={minBidAmount}
              step={product.minIncrement}
              required
            />
            <small>Minimum: {minBidAmount.toLocaleString()} ₫</small>
          </div>

          <div className="form-group">
            <label>Maximum Bid (₫)</label>
            <input
              type="number"
              value={maxBid}
              onChange={(e) => setMaxBid(e.target.value)}
              placeholder={(minBidAmount * 2).toString()}
              min={minBidAmount + product.minIncrement}
              step={product.minIncrement}
              required
            />
            <small>Your highest bid limit</small>
          </div>

          <div className="warning-text">
            <strong>Note:</strong> Your max bid is kept private. Others won't see it.
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Activating...' : 'Activate Auto-Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}