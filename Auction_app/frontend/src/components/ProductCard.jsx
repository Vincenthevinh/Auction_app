import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { formatPrice, calculateTimeRemaining, isProductEnding } from '../utils/helpers';
import '../styles/ProductCard.css';

export default function ProductCard({ product }) {
  const timeRemaining = calculateTimeRemaining(product.endTime);
  const isEnding = isProductEnding(product.endTime);

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-image">
        <img src={product.thumbnail} alt={product.title} />
        {isEnding && <span className="badge-ending">Ending Soon</span>}
        <div className="product-overlay">
          <button className="btn-wishlist" onClick={(e) => e.preventDefault()}>
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>

        <div className="product-stats">
          <span className="stat">
            <Eye size={14} /> {product.viewCount}
          </span>
          <span className="stat">
            💰 {product.bidCount} bids
          </span>
        </div>

        <div className="product-price">
          <span className="current-price">{formatPrice(product.currentPrice)}</span>
          <span className={`time-remaining ${isEnding ? 'urgent' : ''}`}>
            ⏱️ {timeRemaining}
          </span>
        </div>
      </div>
    </Link>
  );
}