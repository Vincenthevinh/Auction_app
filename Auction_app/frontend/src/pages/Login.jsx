import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/uiSlice';
import { validateEmail } from '../utils/helpers';
import '../styles/Auth.css';

// Lấy SITE_KEY của bạn từ Google Admin Console
const RECAPTCHA_SITE_KEY = import.meta.env.RECAPTCHA_SITE_KEY; // <<< THAY THẾ BẰNG SITE KEY THỰC TẾ

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  // THÊM STATE ĐỂ LƯU TOKEN RECAPTCHA
  const [recaptchaToken, setRecaptchaToken] = useState(null); 
  const [recaptchaError, setRecaptchaError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    // KIỂM TRA XÁC MINH RECAPTCHA
    if (!recaptchaToken) {
        setRecaptchaError('Vui lòng xác minh reCAPTCHA.');
        // Đặt lỗi nếu thiếu token
        newErrors.recaptcha = 'Vui lòng xác minh reCAPTCHA.'; 
    } else {
        setRecaptchaError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    // Tạo object data gửi đi, bao gồm cả token
    const loginData = {
        ...formData,
        reCaptchaToken: recaptchaToken, // <<< THÊM TOKEN VÀO DATA
    };

    try {
      // Gửi loginData bao gồm token
      const result = await dispatch(login(loginData)); 
      if (result.payload.token) {
        dispatch(showNotification({
          type: 'success',
          message: 'Logged in successfully!'
        }));
        navigate('/');
      } else if (result.payload.userId) {
        navigate(`/verify-otp/${result.payload.userId}`);
      }
    } catch (error) {
        // Nếu có lỗi từ server (bao gồm cả lỗi reCAPTCHA), chúng ta reset widget
        if (window.grecaptcha) {
            window.grecaptcha.reset();
            setRecaptchaToken(null);
        }
      dispatch(showNotification({
        type: 'error',
        message: error.message
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Hàm Callback khi reCAPTCHA thành công
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  // Hàm Callback khi reCAPTCHA hết hạn
  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setRecaptchaError('Xác minh reCAPTCHA đã hết hạn. Vui lòng xác minh lại.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* ... (Email và Password fields) ... */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* BƯỚC MỚI: WIDGET RECAPTCHA */}
          <div className="form-group recaptcha-group">
            <div 
              className="g-recaptcha" 
              data-sitekey={RECAPTCHA_SITE_KEY} // THAY THẾ KEY THỰC TẾ
              data-callback={handleRecaptchaChange}
              data-expired-callback={handleRecaptchaExpired}
            ></div>
            {recaptchaError && <span className="error-text">{recaptchaError}</span>}
          </div>
          {/* KẾT THÚC WIDGET RECAPTCHA */}

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <a href="/register">Create one</a>
        </p>
      </div>
    </div>
  );
}