import { formatDate, formatPrice } from '../utils/helpers';
import { TrendingUp } from 'lucide-react';
import '../styles/BidHistory.css';

export default function BidHistory({ bids = [] }) {
  return (
    <div className="bid-history">
      <h2>
        <TrendingUp size={20} /> Bid History
      </h2>

      {bids.length > 0 ? (
        <div className="bids-list">
          {bids.map((bid, idx) => (
            <div key={bid._id} className="bid-item">
              <div className="bid-rank">#{bids.length - idx}</div>
              <div className="bid-content">
                <p className="bidder-name">{bid.bidder.name}</p>
                <p className="bid-time">{formatDate(bid.createdAt)}</p>
              </div>
              <div className="bid-amount">{formatPrice(bid.amount)}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-bids">No bids yet. Be the first to bid!</p>
      )}
    </div>
  );
}