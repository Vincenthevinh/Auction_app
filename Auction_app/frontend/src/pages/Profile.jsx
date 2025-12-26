import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { fetchCurrentUser } from '../redux/slices/authSlice';
import { fetchWatchlist } from '../redux/slices/auctionSlice';
import { User, Settings, Award, ShoppingBag, Heart } from 'lucide-react';
import '../styles/Profile.css';
import { WatchlistTab } from '../components/WatchlistTab';
import { SellingTab } from '../components/SellingTab';
import { SalesTab } from '../components/SalesTab';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { watchlist } = useSelector(state => state.auction);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch current user data
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch, navigate]);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || ''
      });
    }
  }, [user]);

  // Load watchlist when tab changes
  useEffect(() => {
    if (activeTab === 'watchlist' && isAuthenticated) {
      dispatch(fetchWatchlist(1));
    }
  }, [activeTab, dispatch, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveMessage('');

    try {
      await api.put('/auth/me', formData);
      setSaveMessage('✅ Profile updated successfully');
      dispatch(fetchCurrentUser());
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('❌ Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={64} />
          </div>
          <div className="profile-basic">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <div className="profile-badges">
              {user.role === 'seller' && (
                <span className="badge badge-seller">Seller</span>
              )}
              {user.role === 'admin' && (
                <span className="badge badge-admin">Admin</span>
              )}
              <span className="badge badge-member">
                Member since {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <aside className="profile-sidebar">
            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <User size={18} /> Personal Info
              </button>
              <button
                className={`nav-item ${activeTab === 'watchlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('watchlist')}
              >
                <Heart size={18} /> Watchlist
              </button>
              {user.role === 'seller' && (
                <>
                  <button
                    className={`nav-item ${activeTab === 'selling' ? 'active' : ''}`}
                    onClick={() => setActiveTab('selling')}
                  >
                    <ShoppingBag size={18} /> My Auctions
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                  >
                    <Award size={18} /> Sales
                  </button>
                </>
              )}
            </nav>
          </aside>

          <main className="profile-main">
            {/* Personal Info Tab */}
            {activeTab === 'info' && (
              <div className="profile-card">
                <h2>Personal Information</h2>
                
                {saveMessage && (
                  <div className={`message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
                    {saveMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email (Read-only)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Enter your country"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{user.totalBids || 0}</div>
                    <div className="stat-label">Total Bids</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{user.totalWins || 0}</div>
                    <div className="stat-label">Auctions Won</div>
                  </div>
                  {user.role === 'seller' && (
                    <>
                      <div className="stat-card">
                        <div className="stat-value">{user.totalSold || 0}</div>
                        <div className="stat-label">Items Sold</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">⭐ {user.sellerRating || 0}</div>
                        <div className="stat-label">Seller Rating</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Watchlist Tab */}
            {activeTab === 'watchlist' && (
              <WatchlistTab watchlist={watchlist} />
            )}

            {/* Selling Tab */}
            {activeTab === 'selling' && user.role === 'seller' && (
              <SellingTab />
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && user.role === 'seller' && (
              <SalesTab />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
