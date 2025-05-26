import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  analytics: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setAnalytics,
  setError,
  clearError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
