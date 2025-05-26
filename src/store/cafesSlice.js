import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cafes: [],
  selectedCafe: null,
  loading: false,
  error: null,
  totalCount: 0,
  filters: {
    search: '',
    category: '',
    status: '',
    location: '',
  },
  pagination: {
    page: 0,
    pageSize: 25,
  },
};

const cafesSlice = createSlice({
  name: 'cafes',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCafes: (state, action) => {
      state.cafes = action.payload;
      state.loading = false;
    },
    setSelectedCafe: (state, action) => {
      state.selectedCafe = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setTotalCount: (state, action) => {
      state.totalCount = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    addCafe: (state, action) => {
      state.cafes.unshift(action.payload);
    },
    updateCafe: (state, action) => {
      const index = state.cafes.findIndex(cafe => cafe.id === action.payload.id);
      if (index !== -1) {
        state.cafes[index] = action.payload;
      }
    },
    deleteCafe: (state, action) => {
      state.cafes = state.cafes.filter(cafe => cafe.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setCafes,
  setSelectedCafe,
  setError,
  setTotalCount,
  setFilters,
  setPagination,
  clearError,
  addCafe,
  updateCafe,
  deleteCafe,
} = cafesSlice.actions;

export default cafesSlice.reducer;
