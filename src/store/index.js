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
        // Ignore these action types
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.date', 'meta.createdAt', 'meta.updatedAt'],
        // Ignore these paths in the state
        ignoredPaths: [
          'items.dates',
          'auth.user.createdAt',
          'auth.user.updatedAt',
          'auth.user.lastLogin',
          'events.events.eventDate',
          'events.events.endDate',
          'events.events.createdAt',
          'events.events.updatedAt',
          'jobs.jobs.createdAt',
          'jobs.jobs.updatedAt',
          'jobs.jobs.expiryDate',
          'cafes.cafes.createdAt',
          'cafes.cafes.updatedAt',
          'restaurants.restaurants.createdAt',
          'restaurants.restaurants.updatedAt',
          'users.users.createdAt',
          'users.users.updatedAt',
          'users.users.lastLogin',
          'users.users.registrationDate',
        ],
      },
    }),
});

export default store;
