import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  Work,
  Event,
  Restaurant,
  LocalCafe,
  TrendingUp,
  Warning,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { formatDate } from '../utils/helpers';
import { firestoreWithRetry } from '../utils/firebaseRetry';
import toast from 'react-hot-toast';

// Initial state for real data
const initialStats = {
  totalUsers: 0,
  totalJobs: 0,
  totalEvents: 0,
  totalRestaurants: 0,
  totalCafes: 0,
  pendingApprovals: 0,
  activeUsers: 0,
};

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value.toLocaleString()}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(initialStats);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real dashboard data from Firebase
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all collections data with retry
      const [usersSnap, jobsSnap, eventsSnap, restaurantsSnap, cafesSnap] = await firestoreWithRetry(
        () => Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'jobs')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'restaurants')),
          getDocs(collection(db, 'cafes')),
        ]),
        'Failed to load dashboard data'
      );

      // Process users data
      const users = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLogin: doc.data().lastLogin?.toDate(),
      }));

      // Process other collections
      const jobs = jobsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      const events = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        eventDate: doc.data().eventDate?.toDate(),
      }));

      const restaurants = restaurantsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      const cafes = cafesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      // Calculate real statistics
      const now = new Date();
      const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      const activeUsers = users.filter(user =>
        user.lastLogin && user.lastLogin > last30Days && user.status === 'active'
      ).length;

      const pendingApprovals = [
        ...jobs.filter(job => job.status === 'pending'),
        ...events.filter(event => event.status === 'pending'),
        ...restaurants.filter(restaurant => restaurant.status === 'pending'),
        ...cafes.filter(cafe => cafe.status === 'pending'),
      ].length;

      // Update stats with real data
      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalEvents: events.length,
        totalRestaurants: restaurants.length,
        totalCafes: cafes.length,
        pendingApprovals,
        activeUsers,
      });

      // Generate recent activity from real data
      const activities = [];

      // Recent users (last 10)
      const recentUsers = users
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 3);

      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          title: 'New user registration',
          description: user.displayName || user.email,
          time: getTimeAgo(user.createdAt),
          status: user.status || 'active',
          timestamp: user.createdAt,
        });
      });

      // Recent jobs (last 5)
      const recentJobs = jobs
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 3);

      recentJobs.forEach(job => {
        activities.push({
          id: `job-${job.id}`,
          type: 'job',
          title: 'Job posting submitted',
          description: job.title,
          time: getTimeAgo(job.createdAt),
          status: job.status || 'pending',
          timestamp: job.createdAt,
        });
      });

      // Recent events (last 5)
      const recentEvents = events
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 3);

      recentEvents.forEach(event => {
        activities.push({
          id: `event-${event.id}`,
          type: 'event',
          title: 'Event created',
          description: event.title,
          time: getTimeAgo(event.createdAt),
          status: event.status || 'pending',
          timestamp: event.createdAt,
        });
      });

      // Recent restaurants (last 3)
      const recentRestaurants = restaurants
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 2);

      recentRestaurants.forEach(restaurant => {
        activities.push({
          id: `restaurant-${restaurant.id}`,
          type: 'restaurant',
          title: 'Restaurant listing added',
          description: restaurant.name,
          time: getTimeAgo(restaurant.createdAt),
          status: restaurant.status || 'pending',
          timestamp: restaurant.createdAt,
        });
      });

      // Sort activities by timestamp and take the most recent 8
      const sortedActivities = activities
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 8);

      setRecentActivity(sortedActivities);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      // Error message already shown by firestoreWithRetry
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    if (!date) return 'Unknown';

    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <People />;
      case 'job':
        return <Work />;
      case 'event':
        return <Event />;
      case 'restaurant':
        return <Restaurant />;
      case 'cafe':
        return <LocalCafe />;
      default:
        return <TrendingUp />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.displayName?.split(' ')[0] || user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your community today.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchDashboardData}
              disabled={loading}
              startIcon={<Refresh />}
            >
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Users (30d)"
            value={stats.activeUsers}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={<Work />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Upcoming Events"
            value={stats.totalEvents}
            icon={<Event />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Restaurants"
            value={stats.totalRestaurants}
            icon={<Restaurant />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Cafes"
            value={stats.totalCafes}
            icon={<LocalCafe />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<Warning />}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Chip
                            label={activity.status}
                            size="small"
                            color={getStatusColor(activity.status)}
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            • {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  fullWidth
                  href="/users"
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Work />}
                  fullWidth
                  href="/jobs"
                >
                  Review Jobs
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Event />}
                  fullWidth
                  href="/events"
                >
                  Manage Events
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Warning />}
                  fullWidth
                  href="/reports"
                >
                  View Reports
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Database: Online</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Storage: Online</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Authentication: Online</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
