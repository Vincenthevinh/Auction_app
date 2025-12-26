import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const register = createAsyncThunk('auth/register', async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (data) => {
  const response = await api.post('/auth/verify-otp', data);
  // Lưu token vào localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
});

export const login = createAsyncThunk('auth/login', async (data) => {
  const response = await api.post('/auth/login', data);
  // Lưu token vào localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user || response.data;
  } catch (error) {
    // Nếu token invalid, xóa nó
    localStorage.removeItem('token');
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

// Khôi phục auth state từ localStorage
export const restoreAuthState = createAsyncThunk('auth/restoreAuthState', async (_, { dispatch }) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Fetch user data
      const response = await api.get('/auth/me');
      return {
        token,
        user: response.data.user || response.data
      };
    } catch (error) {
      // Token invalid, xóa nó
      localStorage.removeItem('token');
      return null;
    }
  }
  return null;
});

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  userId: null,
  isRestoringAuth: true // Flag để track khi restore auth
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.userId = null;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userId = action.payload.userId;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.userId = action.payload.user.id;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.userId = action.payload.user.id;
        } else {
          state.userId = action.payload.userId;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Restore Auth State
      .addCase(restoreAuthState.pending, (state) => {
        state.isRestoringAuth = true;
      })
      .addCase(restoreAuthState.fulfilled, (state, action) => {
        state.isRestoringAuth = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.userId = action.payload.user?.id || action.payload.user?._id;
        }
      })
      .addCase(restoreAuthState.rejected, (state) => {
        state.isRestoringAuth = false;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;