import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchCurrentUser } from '../redux/slices/authSlice';
import { Heart, Search, User, LogOut, Home } from 'lucide-react';
import '../styles/Header.css';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (isAuthenticated && token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, token, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${searchValue}`);
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <Link to="/" className="logo">
              <Home size={24} />
              <span>AuctionHub</span>
            </Link>

            <form className="search-box" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button type="submit">
                <Search size={20} />
              </button>
            </form>

            <div className="header-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/watchlist" className="nav-link">
                    <Heart size={20} />
                    <span>Watchlist</span>
                  </Link>
                  <div className="user-menu">
                    <div className="user-avatar">
                      <User size={20} />
                    </div>
                    <div className="dropdown-menu">
                      <p className="user-name">{user?.name}</p>
                      <Link to="/profile">My Profile</Link>
                      {user?.role === 'seller' && <Link to="/seller/products">Selling</Link>}
                      {user?.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
                      <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-secondary">Login</Link>
                  <Link to="/register" className="btn btn-primary">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <div className="container">
          <CategoryMenu />
        </div>
      </nav>
    </header>
  );
}