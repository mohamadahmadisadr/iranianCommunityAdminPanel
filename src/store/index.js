import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import usersSlice from './usersSlice';
import jobsSlice from './jobsSlice';
import eventsSlice from './eventsSlice';
import restaurantsSlice from './restaurantsSlice';
import cafesSlice from './cafesSlice';
import analyticsSlice from './analyticsSlice';
import settingsSlice from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    jobs: jobsSlice,
    events: eventsSlice,
    restaurants: restaurantsSlice,
    cafes: cafesSlice,
    analytics: analyticsSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
