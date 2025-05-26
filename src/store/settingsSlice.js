import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appSettings: {
    name: 'Iranian Community Canada',
    version: '1.0.0',
    maintenanceMode: false,
    maintenanceMessage: 'App is under maintenance...',
    minAppVersion: '1.0.0',
    forceUpdate: false,
  },
  features: {
    jobPosting: true,
    eventPosting: true,
    restaurantListing: true,
    cafeListingEnabled: true,
    userRegistration: true,
    guestAccess: true,
  },
  moderation: {
    autoApproveJobs: false,
    autoApproveEvents: false,
    autoApproveRestaurants: false,
    autoApproveCafes: false,
    requireEmailVerification: true,
    requirePhoneVerification: false,
  },
  limits: {
    maxJobsPerUser: 5,
    maxEventsPerUser: 3,
    maxRestaurantsPerUser: 2,
    maxCafesPerUser: 2,
    maxImagesPerListing: 5,
    maxImageSizeMB: 5,
  },
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAppSettings: (state, action) => {
      state.appSettings = { ...state.appSettings, ...action.payload };
    },
    setFeatures: (state, action) => {
      state.features = { ...state.features, ...action.payload };
    },
    setModeration: (state, action) => {
      state.moderation = { ...state.moderation, ...action.payload };
    },
    setLimits: (state, action) => {
      state.limits = { ...state.limits, ...action.payload };
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
  setAppSettings,
  setFeatures,
  setModeration,
  setLimits,
  setError,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
