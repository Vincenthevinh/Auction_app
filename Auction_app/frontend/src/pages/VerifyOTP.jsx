import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyOTP } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/uiSlice';
import '../styles/Auth.css';

export default function VerifyOTP() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { loading } = useSelector(state => state.auth);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }

    try {
      const result = await dispatch(verifyOTP({ userId, otp }));
      if (result.payload.token) {
        dispatch(showNotification({
          type: 'success',
          message: 'Email verified successfully!'
        }));
        navigate('/');
      }
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: error.message
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Verify Email</h1>
        <p className="auth-subtitle">Enter the OTP code sent to your email</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError('');
              }}
              placeholder="Enter 6-digit code"
              maxLength="6"
              className={error ? 'input-error' : ''}
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}