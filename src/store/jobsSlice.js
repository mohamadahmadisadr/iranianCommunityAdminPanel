import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobs: [],
  selectedJob: null,
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

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setJobs: (state, action) => {
      state.jobs = action.payload;
      state.loading = false;
    },
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
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
    addJob: (state, action) => {
      state.jobs.unshift(action.payload);
    },
    updateJob: (state, action) => {
      const index = state.jobs.findIndex(job => job.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
    },
    deleteJob: (state, action) => {
      state.jobs = state.jobs.filter(job => job.id !== action.payload);
    },
  },
});

export const {
  setLoading,
  setJobs,
  setSelectedJob,
  setError,
  setTotalCount,
  setFilters,
  setPagination,
  clearError,
  addJob,
  updateJob,
  deleteJob,
} = jobsSlice.actions;

export default jobsSlice.reducer;
