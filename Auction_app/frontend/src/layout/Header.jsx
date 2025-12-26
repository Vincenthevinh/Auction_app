import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Heart, Search, User, LogOut, Home } from 'lucide-react';
import {CategoryMenu} from '../components/CategoryMenu';

import '../styles/Header.css';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isRestoringAuth } = useSelector(state => state.auth);
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
  function handleClickOutside(event) {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setShowDropdown(false);
    }
  }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
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
              {isRestoringAuth ? (
                <div className="auth-loading">Loading...</div>
              ) : isAuthenticated ? (
                <>
                  <Link to="/watchlist" className="nav-link">
                    <Heart size={20} />
                    <span>Watchlist</span>
                  </Link>
                  <div className="user-menu" ref={dropdownRef}>
                    <div
                      className="user-avatar"
                      onClick={() => setShowDropdown(!showDropdown)}
                      title="Click to toggle menu"
                    >
                      <User size={20} />
                    </div>
                    {showDropdown && (
                      <div className="dropdown-menu">
                        <p className="user-name">{user?.name || 'User'}</p>
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                        >
                          My Profile
                        </Link>
                        {user?.role === 'seller' && (
                          <Link
                            to="/seller/products"
                            onClick={() => setShowDropdown(false)}
                          >
                            Selling
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowDropdown(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="logout-btn">
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-secondary">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up
                  </Link>
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