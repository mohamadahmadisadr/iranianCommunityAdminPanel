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
import { formatDate, formatRelativeTime, convertTimestamp } from '../utils/helpers';
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
    setError(null);
    
    try {
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

      // Process users data with safe timestamp conversion
      const users = usersSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          lastLogin: convertTimestamp(data.lastLogin),
        };
      }).filter(user => user.createdAt !== null); // Filter out entries with invalid dates

      // Process other collections
      const processCollection = (snapshot, additionalFields = {}) => {
        return snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: convertTimestamp(data.createdAt),
              ...Object.fromEntries(
                Object.entries(additionalFields).map(([key, field]) => [
                  key,
                  convertTimestamp(data[field])
                ])
              )
            };
          })
          .filter(item => item.createdAt !== null);
      };

      const jobs = processCollection(jobsSnap);
      const events = processCollection(eventsSnap, { eventDate: 'eventDate' });
      const restaurants = processCollection(restaurantsSnap);
      const cafes = processCollection(cafesSnap);

      // Calculate statistics
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

      setStats({
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalEvents: events.length,
        totalRestaurants: restaurants.length,
        totalCafes: cafes.length,
        pendingApprovals,
        activeUsers,
      });

      // Generate recent activity
      const processRecentItems = (items, type, titlePrefix, descriptionField) => {
        return items
          .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
          .slice(0, 3)
          .map(item => ({
            id: `${type}-${item.id}`,
            type,
            title: titlePrefix,
            description: item[descriptionField] || 'No title',
            time: formatRelativeTime(item.createdAt),
            status: item.status || 'pending',
            timestamp: item.createdAt,
          }));
      };

      const activities = [
        ...processRecentItems(users, 'user', 'New user registration', 'displayName'),
        ...processRecentItems(jobs, 'job', 'Job posting submitted', 'title'),
        ...processRecentItems(events, 'event', 'Event created', 'title'),
        ...processRecentItems(restaurants, 'restaurant', 'Restaurant listing added', 'name')
      ];

      // Sort activities by timestamp
      const sortedActivities = activities
        .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
        .slice(0, 8);

      setRecentActivity(sortedActivities);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
                      secondaryTypographyProps={{ component: 'div' }}
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
