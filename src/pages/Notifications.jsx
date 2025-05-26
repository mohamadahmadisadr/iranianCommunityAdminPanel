import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Notifications as NotificationsIcon,
  Email,
  Sms,
  Delete,
  Edit,
  Add,
  People,
  Campaign,
  Schedule,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [sendDialog, setSendDialog] = useState({ open: false, type: 'broadcast' });
  
  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info', // info, success, warning, error
    recipients: 'all', // all, role, specific
    selectedRole: '',
    selectedUsers: [],
    channels: {
      inApp: true,
      email: false,
      sms: false,
    },
    scheduledFor: '',
  });

  // Fetch notifications and users
  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        scheduledFor: doc.data().scheduledFor?.toDate(),
      }));
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please fill in title and message');
      return;
    }

    setLoading(true);
    try {
      // Determine recipients
      let recipientUsers = [];
      
      if (notificationForm.recipients === 'all') {
        recipientUsers = users;
      } else if (notificationForm.recipients === 'role') {
        recipientUsers = users.filter(u => u.role === notificationForm.selectedRole);
      } else if (notificationForm.recipients === 'specific') {
        recipientUsers = users.filter(u => notificationForm.selectedUsers.includes(u.id));
      }

      // Create notification document
      const notificationData = {
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        recipients: notificationForm.recipients,
        selectedRole: notificationForm.selectedRole,
        selectedUsers: notificationForm.selectedUsers,
        channels: notificationForm.channels,
        scheduledFor: notificationForm.scheduledFor ? new Date(notificationForm.scheduledFor) : null,
        status: notificationForm.scheduledFor ? 'scheduled' : 'sent',
        sentBy: user.uid,
        sentByName: user.displayName || user.email,
        recipientCount: recipientUsers.length,
        createdAt: serverTimestamp(),
      };

      // Save notification to database
      const notificationRef = await addDoc(collection(db, 'notifications'), notificationData);

      // Send in-app notifications if enabled
      if (notificationForm.channels.inApp) {
        await sendInAppNotifications(notificationRef.id, recipientUsers);
      }

      // Send email notifications if enabled
      if (notificationForm.channels.email) {
        await sendEmailNotifications(recipientUsers);
      }

      // Send SMS notifications if enabled (placeholder)
      if (notificationForm.channels.sms) {
        await sendSMSNotifications(recipientUsers);
      }

      toast.success(`Notification sent to ${recipientUsers.length} users`);
      setSendDialog({ open: false, type: 'broadcast' });
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const sendInAppNotifications = async (notificationId, recipients) => {
    try {
      const batch = [];
      
      for (const recipient of recipients) {
        const userNotification = {
          notificationId,
          userId: recipient.id,
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          read: false,
          createdAt: serverTimestamp(),
        };
        
        batch.push(addDoc(collection(db, 'userNotifications'), userNotification));
      }
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error sending in-app notifications:', error);
    }
  };

  const sendEmailNotifications = async (recipients) => {
    try {
      // In a real implementation, you would integrate with an email service
      // like SendGrid, Mailgun, or Firebase Functions with Nodemailer
      
      const emailData = {
        subject: notificationForm.title,
        body: notificationForm.message,
        recipients: recipients.map(u => u.email),
        sentBy: user.email,
        createdAt: serverTimestamp(),
      };
      
      // Save email log to database
      await addDoc(collection(db, 'emailLogs'), emailData);
      
      // Here you would call your email service API
      console.log('Email notification would be sent to:', recipients.map(u => u.email));
      
    } catch (error) {
      console.error('Error sending email notifications:', error);
    }
  };

  const sendSMSNotifications = async (recipients) => {
    try {
      // In a real implementation, you would integrate with an SMS service
      // like Twilio, AWS SNS, or similar
      
      const smsData = {
        message: `${notificationForm.title}: ${notificationForm.message}`,
        recipients: recipients.filter(u => u.phone).map(u => u.phone),
        sentBy: user.email,
        createdAt: serverTimestamp(),
      };
      
      // Save SMS log to database
      await addDoc(collection(db, 'smsLogs'), smsData);
      
      // Here you would call your SMS service API
      console.log('SMS notification would be sent to:', smsData.recipients);
      
    } catch (error) {
      console.error('Error sending SMS notifications:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const resetForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
      selectedRole: '',
      selectedUsers: [],
      channels: {
        inApp: true,
        email: false,
        sms: false,
      },
      scheduledFor: '',
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <NotificationsIcon color="info" />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'sent':
        return <Chip label="Sent" color="success" size="small" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="warning" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label="Unknown" color="default" size="small" />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Notifications</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setSendDialog({ open: true, type: 'broadcast' })}
        >
          Send Notification
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="All Notifications" />
          <Tab label="Sent Notifications" />
          <Tab label="Scheduled" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Sent
                    </Typography>
                    <Typography variant="h4">
                      {notifications.filter(n => n.status === 'sent').length}
                    </Typography>
                  </Box>
                  <Send color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Scheduled
                    </Typography>
                    <Typography variant="h4">
                      {notifications.filter(n => n.status === 'scheduled').length}
                    </Typography>
                  </Box>
                  <Schedule color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {users.length}
                    </Typography>
                  </Box>
                  <People color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      This Month
                    </Typography>
                    <Typography variant="h4">
                      {notifications.filter(n => {
                        const now = new Date();
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        return n.createdAt && n.createdAt >= monthStart;
                      }).length}
                    </Typography>
                  </Box>
                  <Campaign color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications List */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Notifications
                </Typography>
                <List>
                  {notifications.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {notification.title}
                              </Typography>
                              {getStatusChip(notification.status)}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Sent to {notification.recipientCount} users • {formatDate(notification.createdAt)} • By {notification.sentByName}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  {notifications.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="No notifications sent yet"
                        secondary="Send your first notification to get started"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Send Notification Dialog */}
      <Dialog open={sendDialog.open} onClose={() => setSendDialog({ open: false, type: 'broadcast' })} maxWidth="md" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notification Title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={notificationForm.type}
                  label="Type"
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Recipients</InputLabel>
                <Select
                  value={notificationForm.recipients}
                  label="Recipients"
                  onChange={(e) => setNotificationForm({ ...notificationForm, recipients: e.target.value })}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="role">By Role</MenuItem>
                  <MenuItem value="specific">Specific Users</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {notificationForm.recipients === 'role' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Role</InputLabel>
                  <Select
                    value={notificationForm.selectedRole}
                    label="Select Role"
                    onChange={(e) => setNotificationForm({ ...notificationForm, selectedRole: e.target.value })}
                  >
                    <MenuItem value="user">Users</MenuItem>
                    <MenuItem value="moderator">Moderators</MenuItem>
                    <MenuItem value="admin">Admins</MenuItem>
                    <MenuItem value="super_admin">Super Admins</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {/* Delivery Channels */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Delivery Channels
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationForm.channels.inApp}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      channels: { ...notificationForm.channels, inApp: e.target.checked }
                    })}
                  />
                }
                label="In-App Notification"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationForm.channels.email}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      channels: { ...notificationForm.channels, email: e.target.checked }
                    })}
                  />
                }
                label="Email Notification"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationForm.channels.sms}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      channels: { ...notificationForm.channels, sms: e.target.checked }
                    })}
                  />
                }
                label="SMS Notification"
              />
            </Grid>
            
            {/* Scheduling */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Schedule For (Optional)"
                type="datetime-local"
                value={notificationForm.scheduledFor}
                onChange={(e) => setNotificationForm({ ...notificationForm, scheduledFor: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty to send immediately"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog({ open: false, type: 'broadcast' })}>
            Cancel
          </Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;
