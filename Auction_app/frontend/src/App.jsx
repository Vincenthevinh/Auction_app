import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreAuthState } from './redux/slices/authSlice';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Notification from './components/Notification';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreateProduct from './pages/CreateProduct';
import NotFound from './pages/NotFound';

import './App.css';

function PrivateRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, isRestoringAuth} = useSelector(state => state.auth);

  if (isRestoringAuth) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { isRestoringAuth } = useSelector(state => state.auth);

  // Restore auth state on app load
  useEffect(() => {
    dispatch(restoreAuthState());
  }, [dispatch]);

  return (
    <Router>
      <div className="app">
        <Header /> {/* <-- Luôn nằm trong <Router> */}
        <main className="app-main">
          {isRestoringAuth ? (
            // LOGIC LOADING BÂY GIỜ NẰM BÊN TRONG <Router>
            <div className="loading" style={{ minHeight: '400px' }}>
              Restoring your session...
            </div>
          ) : (
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp/:userId" element={<VerifyOTP />} />
              <Route path="/login" element={<Login />} />

              {/* Private Routes */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Seller Routes */}
              <Route
                path="/seller/create-product"
                element={
                  <PrivateRoute requiredRole="seller">
                    <CreateProduct />
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </main>
        <Footer />
        <Notification />
      </div>
    </Router>
  );
}