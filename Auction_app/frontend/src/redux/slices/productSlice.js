import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, limit = 12, category = '', search = '', sort = '' }) => {
    const params = { page, limit };
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    const response = await api.get('/products', { params });
    return response.data;
  }
);

export const fetchProductDetail = createAsyncThunk(
  'products/fetchProductDetail',
  async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (type = 'ending-soon') => {
    const response = await api.get(`/products/featured/${type}`);
    return { type, data: response.data };
  }
);

const initialState = {
  items: [],
  detail: null,
  featured: { 'ending-soon': [], 'trending': [], 'high-price': [] },
  pagination: { page: 1, limit: 12, total: 0, pages: 0 },
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearDetail: (state) => {
      state.detail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featured[action.payload.type] = action.payload.data;
      });
  }
});

export const { clearDetail } = productSlice.actions;
export default productSlice.reducer;