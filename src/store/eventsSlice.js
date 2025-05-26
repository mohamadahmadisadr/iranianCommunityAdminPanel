import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  selectedEvent: null,
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

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEvents: (state, action) => {
      state.events = action.payload;
      state.loading = false;
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
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
    addEvent: (state, action) => {
      state.events.unshift(action.payload);
    },
    updateEvent: (state, action) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setEvents,
  setSelectedEvent,
  setError,
  setTotalCount,
  setFilters,
  setPagination,
  clearError,
  addEvent,
  updateEvent,
  deleteEvent,
} = eventsSlice.actions;

export default eventsSlice.reducer;
