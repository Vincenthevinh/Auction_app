import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Settings, Award, ShoppingBag } from 'lucide-react';
import '../styles/Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || ''
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/me', formData);
      alert('Profile updated successfully');
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
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
              <span className="badge badge-member">Member since {new Date(user.createdAt).getFullYear()}</span>
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
                <Settings size={18} /> Watchlist
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
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
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
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{user.totalBids}</div>
                    <div className="stat-label">Total Bids</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{user.totalWins}</div>
                    <div className="stat-label">Auctions Won</div>
                  </div>
                  {user.role === 'seller' && (
                    <>
                      <div className="stat-card">
                        <div className="stat-value">{user.totalSold}</div>
                        <div className="stat-label">Items Sold</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">⭐ {user.sellerRating}</div>
                        <div className="stat-label">Seller Rating</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Watchlist Tab */}
            {activeTab === 'watchlist' && (
              <WatchlistTab />
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