import { Award, MapPin, Package } from 'lucide-react';

export default function SellerInfo({ seller }) {
  if (!seller) return null;

  return (
    <div className="seller-info-card">
      <h3>Seller Information</h3>
      
      <div className="seller-header">
        <div className="seller-avatar">
          <Award size={32} />
        </div>
        <div className="seller-basic">
          <h4>{seller.shopName || seller.name}</h4>
          <p className="seller-rating">⭐ {seller.sellerRating || 0}</p>
        </div>
      </div>

      <div className="seller-stats">
        <div className="stat">
          <Package size={18} />
          <div>
            <p className="stat-label">Items Sold</p>
            <p className="stat-value">{seller.totalSold || 0}</p>
          </div>
        </div>
        <div className="stat">
          <MapPin size={18} />
          <div>
            <p className="stat-label">Location</p>
            <p className="stat-value">{seller.city || 'N/A'}</p>
          </div>
        </div>
      </div>

      <button className="btn btn-secondary btn-block">
        Contact Seller
      </button>
    </div>
  );
}

// ===== frontend/src/utils/helpers.js (ADD THIS EXPORT) =====
// Thêm hàm này vào file helpers.js đã có:

export const validateBidAmount = (currentPrice, minIncrement, bidAmount) => {
  const minBidAmount = currentPrice + minIncrement;
  if (bidAmount < minBidAmount) {
    return `Bid must be at least ${minBidAmount}`;
  }
  return null;
};

export const isProductEnding = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diffMinutes = (end - now) / (1000 * 60);
  return diffMinutes < 60;
};