import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatchlist, removeFromWatchlist } from '../redux/slices/auctionSlice';
import ProductCard from './ProductCard';
import { Trash2, Heart } from 'lucide-react';
import '../styles/WatchlistTab.css';

export function WatchlistTab({ watchlist }) {
  const dispatch = useDispatch();

  if (!watchlist || !watchlist.items) {
    return (
      <div className="profile-card">
        <h2>My Watchlist</h2>
        <div className="empty-state">
          <Heart size={48} />
          <p>Your watchlist is empty</p>
        </div>
      </div>
    );
  }

  const { items = [] } = watchlist;

  const handleRemove = async (productId) => {
    if (window.confirm('Remove from watchlist?')) {
      try {
        await dispatch(removeFromWatchlist(productId));
        dispatch(fetchWatchlist(1));
      } catch (error) {
        console.error('Error removing from watchlist:', error);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="profile-card">
        <h2>My Watchlist</h2>
        <div className="empty-state">
          <Heart size={48} />
          <p>Your watchlist is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h2>My Watchlist ({items.length})</h2>
      <div className="watchlist-grid">
        {items.map(product => (
          <div key={product._id} className="watchlist-item">
            <ProductCard product={product} />
            <button
              onClick={() => handleRemove(product._id)}
              className="btn-remove-watchlist"
              title="Remove from watchlist"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}