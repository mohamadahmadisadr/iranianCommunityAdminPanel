import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  People,
  Work,
  Event,
  Restaurant,
  LocalCafe,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { setAnalytics, setLoading, setError } from '../store/analyticsSlice';
import { formatDate, serializeDates } from '../utils/helpers';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#1976d2', '#dc004e', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];

const Analytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading, error } = useSelector((state) => state.analytics);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [realTimeData, setRealTimeData] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalRestaurants: 0,
    totalCafes: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    recentActivity: [],
  });

  // Fetch real analytics data from Firebase
  const fetchAnalyticsData = async () => {
    dispatch(setLoading(true));
    try {
      // Fetch data from Firestore
      const [usersSnap, jobsSnap, eventsSnap, restaurantsSnap, cafesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'jobs')),
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'restaurants')),
        getDocs(collection(db, 'cafes')),
      ]);

      // Convert snapshots to data with serialized dates
      const users = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const jobs = jobsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const events = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const restaurants = restaurantsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const cafes = cafesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate analytics data
      const now = new Date();
      const activeUsers = users.filter(user => {
        const lastLogin = user.lastLogin ? (typeof user.lastLogin.toDate === 'function' ? user.lastLogin.toDate() : new Date(user.lastLogin)) : null;
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        return lastLogin && lastLogin > thirtyDaysAgo && user.status === 'active';
      }).length;

      const pendingApprovals = [
        ...jobs.filter(job => job.status === 'pending'),
        ...events.filter(event => event.status === 'pending'),
        ...restaurants.filter(restaurant => restaurant.status === 'pending'),
        ...cafes.filter(cafe => cafe.status === 'pending'),
      ].length;

      // Use serializeDates to ensure all dates are serialized
      const analyticsData = {
        overview: {
          totalUsers: users.length,
          totalJobs: jobs.length,
          totalEvents: events.length,
          totalRestaurants: restaurants.length,
          totalCafes: cafes.length,
          activeUsers,
          pendingApprovals,
        },
        userRegistrationTrends: generateTimeSeriesData(users, 'createdAt', timeRange),
        contentCreationTrends: generateContentTrends(jobs, events, restaurants, cafes),
        statusDistribution: calculateStatusDistribution(users, jobs, events),
        categoryDistribution: calculateCategoryDistribution(jobs, events),
        recentActivity: generateRecentActivity(users, jobs, events, restaurants, cafes),
        userRoleDistribution: calculateUserRoleDistribution(users),
        monthlyGrowth: calculateMonthlyGrowth(users, jobs, events),
      };

      // Serialize the entire analytics data before storing in Redux
      const serializedData = serializeDates(analyticsData);
      
      setRealTimeData(serializedData.overview);
      dispatch(setAnalytics(serializedData));
      dispatch(setError(null));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      dispatch(setError(error.message));
      toast.error('Failed to fetch analytics data');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Helper functions for data processing
  const generateTimeSeriesData = (data, dateField, days) => {
    const result = [];
    const now = new Date();
    
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const count = data.filter(item => {
        const itemDate = item[dateField] ? (typeof item[dateField].toDate === 'function' ? item[dateField].toDate() : new Date(item[dateField])) : null;
        return itemDate && itemDate >= dayStart && itemDate <= dayEnd;
      }).length;
      
      result.push({
        date: dayStart.toISOString(),
        count,
        label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    
    return serializeDates(result);
  };

  const generateContentTrends = (jobs, events, restaurants, cafes, days) => {
    const result = [];
    const now = new Date();
    
    const getSerializedDate = (item) => {
      if (!item.createdAt) return null;
      return typeof item.createdAt.toDate === 'function' ? 
        item.createdAt.toDate().toISOString() : 
        new Date(item.createdAt).toISOString();
    };
    
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const jobsCount = jobs.filter(item => {
        const itemDate = getSerializedDate(item);
        return itemDate && itemDate >= dayStart.toISOString() && itemDate <= dayEnd.toISOString();
      }).length;
      
      const eventsCount = events.filter(item => {
        const itemDate = getSerializedDate(item);
        return itemDate && itemDate >= dayStart.toISOString() && itemDate <= dayEnd.toISOString();
      }).length;
      
      const restaurantsCount = restaurants.filter(item => {
        const itemDate = getSerializedDate(item);
        return itemDate && itemDate >= dayStart.toISOString() && itemDate <= dayEnd.toISOString();
      }).length;
      
      const cafesCount = cafes.filter(item => {
        const itemDate = getSerializedDate(item);
        return itemDate && itemDate >= dayStart.toISOString() && itemDate <= dayEnd.toISOString();
      }).length;
      
      result.push({
        date: dayStart.toISOString(),
        jobs: jobsCount,
        events: eventsCount,
        restaurants: restaurantsCount,
        cafes: cafesCount,
        label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    
    return serializeDates(result);
  };

  const calculateStatusDistribution = (jobs, events, restaurants, cafes) => {
    const allItems = [...jobs, ...events, ...restaurants, ...cafes];
    const statusCounts = {};
    
    allItems.forEach(item => {
      const status = item.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / allItems.length) * 100).toFixed(1),
    }));
  };

  const calculateCategoryDistribution = (jobs, events, restaurants, cafes) => {
    const categories = {};
    
    jobs.forEach(job => {
      const category = job.category || 'Other';
      categories[`Jobs: ${category}`] = (categories[`Jobs: ${category}`] || 0) + 1;
    });
    
    events.forEach(event => {
      const category = event.category || 'Other';
      categories[`Events: ${category}`] = (categories[`Events: ${category}`] || 0) + 1;
    });
    
    restaurants.forEach(restaurant => {
      const category = restaurant.category || 'Other';
      categories[`Restaurants: ${category}`] = (categories[`Restaurants: ${category}`] || 0) + 1;
    });
    
    cafes.forEach(cafe => {
      const category = cafe.category || 'Other';
      categories[`Cafes: ${category}`] = (categories[`Cafes: ${category}`] || 0) + 1;
    });
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 categories
      .map(([name, value]) => ({ name, value }));
  };

  const calculateUserRoleDistribution = (users) => {
    const roleCounts = {};
    
    users.forEach(user => {
      const role = user.role || 'user';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
    }));
  };

  const calculateMonthlyGrowth = (users, jobs, events) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const usersCount = users.filter(user => 
        user.createdAt && user.createdAt >= date && user.createdAt < nextMonth
      ).length;
      
      const jobsCount = jobs.filter(job => 
        job.createdAt && job.createdAt >= date && job.createdAt < nextMonth
      ).length;
      
      const eventsCount = events.filter(event => 
        event.createdAt && event.createdAt >= date && event.createdAt < nextMonth
      ).length;
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: usersCount,
        jobs: jobsCount,
        events: eventsCount,
      });
    }
    
    return months;
  };

  const generateRecentActivity = (users, jobs, events, restaurants, cafes) => {
    const activities = [];
    
    const getSerializedDate = (item) => {
      if (!item.createdAt) return null;
      if (typeof item.createdAt === 'string') return item.createdAt;
      return typeof item.createdAt.toDate === 'function' ? 
        item.createdAt.toDate().toISOString() : 
        new Date(item.createdAt).toISOString();
    };
    
    // Recent users
    users.slice(-5).forEach(user => {
      activities.push({
        type: 'user',
        action: 'registered',
        item: user.displayName || user.email,
        timestamp: getSerializedDate(user),
        icon: 'people',
      });
    });
    
    // Recent jobs
    jobs.slice(-5).forEach(job => {
      activities.push({
        type: 'job',
        action: 'posted',
        item: job.title,
        timestamp: getSerializedDate(job),
        icon: 'work',
      });
    });
    
    // Recent events
    events.slice(-5).forEach(event => {
      activities.push({
        type: 'event',
        action: 'created',
        item: event.title,
        timestamp: getSerializedDate(event),
        icon: 'event',
      });
    });
    
    return activities
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, 10);
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
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {realTimeData.totalUsers}
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Users
                  </Typography>
                  <Typography variant="h4">
                    {realTimeData.activeUsers}
                  </Typography>
                </Box>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Jobs
                  </Typography>
                  <Typography variant="h4">
                    {realTimeData.totalJobs}
                  </Typography>
                </Box>
                <Work color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Events
                  </Typography>
                  <Typography variant="h4">
                    {realTimeData.totalEvents}
                  </Typography>
                </Box>
                <Event color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Restaurants
                  </Typography>
                  <Typography variant="h4">
                    {realTimeData.totalRestaurants}
                  </Typography>
                </Box>
                <Restaurant color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Approvals
                  </Typography>
                  <Typography variant="h4">
                    {realTimeData.pendingApprovals}
                  </Typography>
                  {realTimeData.pendingApprovals > 0 && (
                    <Chip label="Needs Attention" color="warning" size="small" />
                  )}
                </Box>
                <AnalyticsIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* User Registration Trends */}
        {analytics?.userRegistrationTrends && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Registration Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.userRegistrationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Content Creation Trends */}
        {analytics?.contentCreationTrends && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Content Creation Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.contentCreationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="jobs" stroke="#1976d2" strokeWidth={2} />
                    <Line type="monotone" dataKey="events" stroke="#dc004e" strokeWidth={2} />
                    <Line type="monotone" dataKey="restaurants" stroke="#4caf50" strokeWidth={2} />
                    <Line type="monotone" dataKey="cafes" stroke="#ff9800" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Status Distribution */}
        {analytics?.statusDistribution && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Content Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* User Role Distribution */}
        {analytics?.userRoleDistribution && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Role Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.userRoleDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Monthly Growth */}
        {analytics?.monthlyGrowth && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Growth Trends
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#1976d2" name="New Users" />
                    <Bar dataKey="jobs" fill="#dc004e" name="New Jobs" />
                    <Bar dataKey="events" fill="#4caf50" name="New Events" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Analytics;
