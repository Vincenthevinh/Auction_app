import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const placeBid = createAsyncThunk(
  'auction/placeBid',
  async ({ productId, amount }) => {
    const response = await api.post(`/auction/${productId}/bid`, { amount });
    return response.data;
  }
);

export const fetchBidHistory = createAsyncThunk(
  'auction/fetchBidHistory',
  async (productId) => {
    const response = await api.get(`/auction/${productId}/bids`);
    return response.data;
  }
);

export const addToWatchlist = createAsyncThunk(
  'auction/addToWatchlist',
  async (productId) => {
    const response = await api.post(`/auction/${productId}/watchlist`);
    return response.data;
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'auction/removeFromWatchlist',
  async (productId) => {
    const response = await api.delete(`/auction/${productId}/watchlist`);
    return response.data;
  }
);

export const fetchWatchlist = createAsyncThunk(
  'auction/fetchWatchlist',
  async (page = 1) => {
    const response = await api.get('/auction/watchlist/user', { params: { page } });
    return response.data;
  }
);

const initialState = {
  bidHistory: [],
  watchlist: { items: [], pagination: {} },
  loading: false,
  error: null,
  biddingProduct: null
};

const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    clearBidHistory: (state) => {
      state.bidHistory = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        state.biddingProduct = action.payload.product;
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBidHistory.fulfilled, (state, action) => {
        state.bidHistory = action.payload;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.watchlist = action.payload;
      });
  }
});

export const { clearBidHistory } = auctionSlice.actions;
export default auctionSlice.reducer;