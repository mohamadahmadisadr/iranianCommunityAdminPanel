import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  restaurants: [],
  selectedRestaurant: null,
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

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
      state.loading = false;
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
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
    addRestaurant: (state, action) => {
      state.restaurants.unshift(action.payload);
    },
    updateRestaurant: (state, action) => {
      const index = state.restaurants.findIndex(restaurant => restaurant.id === action.payload.id);
      if (index !== -1) {
        state.restaurants[index] = action.payload;
      }
    },
    deleteRestaurant: (state, action) => {
      state.restaurants = state.restaurants.filter(restaurant => restaurant.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setRestaurants,
  setSelectedRestaurant,
  setError,
  setTotalCount,
  setFilters,
  setPagination,
  clearError,
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = restaurantsSlice.actions;

export default restaurantsSlice.reducer;
