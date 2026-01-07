import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../redux/slices/authSlice';
import { showNotification } from '../redux/slices/uiSlice';
import { validateEmail } from '../utils/helpers';
import '../styles/Auth.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({

    email: '',
    password: ''
  });



  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {

    e.preventDefault();



    if (!validateForm()) return;



    try {

      const result = await dispatch(login(formData));

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



  return (

    <div className="auth-container">

      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">Sign in to your account</p>



        {error && <div className="error-message">{error}</div>}



        <form onSubmit={handleSubmit} className="auth-form">

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