/**
 * Main Application Component
 *
 * This is the root component of the Iranian Community Admin Panel.
 * It sets up the application structure including:
 * - Redux store provider for state management
 * - Material-UI theme provider for consistent styling
 * - React Router for navigation
 * - Authentication wrapper for user session management
 * - Error boundary for graceful error handling
 * - Global toast notifications
 *
 * @author Mohammad Ahmad Isadr
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import theme from './styles/theme';
import store from './store';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/authSlice';
import { onAuthStateChange } from './services/auth';

// Layout Components
import AdminLayout from './components/common/Layout/AdminLayout';
import AuthLoader from './components/common/AuthLoader';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Jobs from './pages/Jobs';
import Events from './pages/Events';
import Restaurants from './pages/Restaurants';
import Cafes from './pages/Cafes';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

/**
 * Protected Route Component
 *
 * Wraps routes that require authentication. Redirects unauthenticated
 * users to the login page.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactElement} Protected content or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * Authentication Wrapper Component
 *
 * Manages the authentication state of the application. Listens for
 * Firebase auth state changes and updates the Redux store accordingly.
 * Shows a loading screen while determining the initial auth state.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} Children or loading screen
 */
const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, initializing } = useSelector((state) => state.auth);

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      dispatch(setUser(user));
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [dispatch]);

  // Show loading screen while determining auth state
  if (initializing) {
    return <AuthLoader />;
  }

  return children;
};

/**
 * Main App Component
 *
 * Sets up the complete application structure with all necessary providers
 * and routing configuration. The component hierarchy is:
 *
 * Provider (Redux) → ThemeProvider (MUI) → ErrorBoundary → Router → AuthWrapper → Routes
 *
 * @returns {React.ReactElement} The complete application structure
 */
function App() {
  return (
    // Redux store provider for global state management
    <Provider store={store}>
      {/* Material-UI theme provider for consistent styling */}
      <ThemeProvider theme={theme}>
        {/* CSS baseline for consistent cross-browser styling */}
        <CssBaseline />
        {/* Error boundary to catch and handle JavaScript errors gracefully */}
        <ErrorBoundary>
          {/* React Router for client-side navigation */}
          <Router>
            {/* Authentication wrapper to manage user sessions */}
            <AuthWrapper>
              <Routes>
                {/* Public Routes - accessible without authentication */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes - require authentication */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard - Main landing page with analytics overview */}
                  <Route index element={<Dashboard />} />

                  {/* User Management - CRUD operations for users */}
                  <Route path="users" element={<Users />} />

                  {/* Content Management Routes */}
                  <Route path="jobs" element={<Jobs />} />
                  <Route path="events" element={<Events />} />
                  <Route path="restaurants" element={<Restaurants />} />
                  <Route path="cafes" element={<Cafes />} />

                  {/* Analytics - Detailed platform analytics and reports */}
                  <Route path="analytics" element={<Analytics />} />

                  {/* Notifications - Send and manage user notifications */}
                  <Route path="notifications" element={<Notifications />} />

                  {/* Settings - Platform configuration and admin preferences */}
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Catch all route - redirect unknown paths to dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>

              {/* Global toast notifications for user feedback */}
              <Toaster position="top-right" />
            </AuthWrapper>
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
