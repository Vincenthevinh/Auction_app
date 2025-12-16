import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatchlist, removeFromWatchlist } from '../redux/slices/auctionSlice';
import ProductCard from './ProductCard';
import { Trash2, Heart } from 'lucide-react';
import '../styles/WatchlistTab.css';

export function WatchlistTab() {
  const dispatch = useDispatch();
  const { watchlist } = useSelector(state => state.auction);

  useEffect(() => {
    dispatch(fetchWatchlist(1));
  }, [dispatch]);

  const handleRemove = async (productId) => {
    if (window.confirm('Remove from watchlist?')) {
      await dispatch(removeFromWatchlist(productId));
      dispatch(fetchWatchlist(1));
    }
  };

  if (!watchlist.items || watchlist.items.length === 0) {
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
      <h2>My Watchlist ({watchlist.items.length})</h2>
      <div className="watchlist-grid">
        {watchlist.items.map(product => (
          <div key={product._id} className="watchlist-item">
            <ProductCard product={product} />
            <button
              onClick={() => handleRemove(product._id)}
              className="btn-remove-watchlist"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}