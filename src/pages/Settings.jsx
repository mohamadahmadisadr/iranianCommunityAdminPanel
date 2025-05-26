import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Save,
  Edit,
  Delete,
  Add,
  Security,
  Notifications,
  Language,
  Palette,
  Storage,
  Email,
  Sms,
  CloudUpload,
  Backup,
  RestoreFromTrash,
  AdminPanelSettings,
  Public,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { doc, updateDoc, getDoc, collection, getDocs, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { updateProfile } from '../store/authSlice';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Iranian Community Canada',
    siteDescription: 'Connecting Iranian community across Canada',
    contactEmail: 'info@iraniancommunitycanda.ca',
    supportEmail: 'support@iraniancommunitycanda.ca',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Main St, Toronto, ON, Canada',
    timezone: 'America/Toronto',
    language: 'en',
    currency: 'CAD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    enableTwoFactorAuth: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    enableAuditLog: true,
    requireAdminApproval: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newUserRegistration: true,
    contentSubmission: true,
    systemAlerts: true,
    weeklyReports: true,
    maintenanceNotices: true,
  });

  // Content Settings
  const [contentSettings, setContentSettings] = useState({
    autoApproveJobs: false,
    autoApproveEvents: false,
    autoApproveRestaurants: false,
    autoApproveCafes: false,
    enableComments: true,
    enableRatings: true,
    moderateComments: true,
    maxImageSize: 5, // MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
    contentRetentionDays: 365,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: 'noreply@iraniancommunitycanda.ca',
    fromName: 'Iranian Community Canada',
    emailProvider: 'sendgrid', // sendgrid, mailgun, ses
    apiKey: '',
  });

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // API Keys Management
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: [] });
  const [apiKeyDialog, setApiKeyDialog] = useState(false);

  useEffect(() => {
    loadSettings();
    loadApiKeys();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from Firebase
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setGeneralSettings(prev => ({ ...prev, ...data.general }));
        setSecuritySettings(prev => ({ ...prev, ...data.security }));
        setNotificationSettings(prev => ({ ...prev, ...data.notifications }));
        setContentSettings(prev => ({ ...prev, ...data.content }));
        setEmailSettings(prev => ({ ...prev, ...data.email }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadApiKeys = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'apiKeys'));
      const keys = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const saveSettings = async (settingsType) => {
    setLoading(true);
    try {
      const settingsData = {
        general: generalSettings,
        security: securitySettings,
        notifications: notificationSettings,
        content: contentSettings,
        email: emailSettings,
        updatedAt: new Date(),
        updatedBy: user.uid,
      };

      await updateDoc(doc(db, 'settings', 'general'), settingsData);
      toast.success(`${settingsType} settings saved successfully`);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (profileSettings.newPassword && profileSettings.newPassword !== profileSettings.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        firstName: profileSettings.firstName,
        lastName: profileSettings.lastName,
        phone: profileSettings.phone,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);
      dispatch(updateProfile(updateData));
      toast.success('Profile updated successfully');

      // Clear password fields
      setProfileSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!newApiKey.name) {
      toast.error('Please enter API key name');
      return;
    }

    try {
      const keyData = {
        name: newApiKey.name,
        key: `ak_${Math.random().toString(36).substr(2, 32)}`,
        permissions: newApiKey.permissions,
        createdAt: new Date(),
        createdBy: user.uid,
        active: true,
      };

      await addDoc(collection(db, 'apiKeys'), keyData);
      toast.success('API key generated successfully');
      setApiKeyDialog(false);
      setNewApiKey({ name: '', permissions: [] });
      loadApiKeys();
    } catch (error) {
      console.error('Error generating API key:', error);
      toast.error('Failed to generate API key');
    }
  };

  const deleteApiKey = async (keyId) => {
    try {
      await deleteDoc(doc(db, 'apiKeys', keyId));
      toast.success('API key deleted successfully');
      loadApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const exportSettings = () => {
    const settingsData = {
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings,
      content: contentSettings,
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
    };

    const dataStr = JSON.stringify(settingsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        if (importedData.general) setGeneralSettings(importedData.general);
        if (importedData.security) setSecuritySettings(importedData.security);
        if (importedData.notifications) setNotificationSettings(importedData.notifications);
        if (importedData.content) setContentSettings(importedData.content);

        toast.success('Settings imported successfully');
      } catch (error) {
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Settings</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            component="label"
          >
            Import
            <input
              type="file"
              accept=".json"
              hidden
              onChange={importSettings}
            />
          </Button>
          <Button
            variant="outlined"
            startIcon={<Backup />}
            onClick={exportSettings}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="General" />
          <Tab label="Security" />
          <Tab label="Notifications" />
          <Tab label="Content" />
          <Tab label="Email" />
          <Tab label="Profile" />
          <Tab label="API Keys" />
        </Tabs>
      </Box>

      {/* General Settings */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Site Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Site Name"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Site Description"
                      multiline
                      rows={3}
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={generalSettings.phoneNumber}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, phoneNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={generalSettings.timezone}
                        label="Timezone"
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      >
                        <MenuItem value="America/Toronto">Eastern Time</MenuItem>
                        <MenuItem value="America/Vancouver">Pacific Time</MenuItem>
                        <MenuItem value="America/Edmonton">Mountain Time</MenuItem>
                        <MenuItem value="America/Winnipeg">Central Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => saveSettings('General')}
                    disabled={loading}
                  >
                    Save General Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Localization
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={generalSettings.language}
                        label="Language"
                        onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="fa">Persian (فارسی)</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={generalSettings.currency}
                        label="Currency"
                        onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      >
                        <MenuItem value="CAD">Canadian Dollar (CAD)</MenuItem>
                        <MenuItem value="USD">US Dollar (USD)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Date Format</InputLabel>
                      <Select
                        value={generalSettings.dateFormat}
                        label="Date Format"
                        onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                      >
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Security Settings */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Authentication
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Require Email Verification"
                      secondary="Users must verify their email before accessing the platform"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={securitySettings.requireEmailVerification}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          requireEmailVerification: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Enable 2FA for admin accounts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={securitySettings.enableTwoFactorAuth}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          enableTwoFactorAuth: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Require Admin Approval"
                      secondary="New users need admin approval"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={securitySettings.requireAdminApproval}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          requireAdminApproval: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Min Password Length"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        passwordMinLength: parseInt(e.target.value)
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value)
                      })}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => saveSettings('Security')}
                    disabled={loading}
                  >
                    Save Security Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Access Control
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Login Attempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        maxLoginAttempts: parseInt(e.target.value)
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Lockout Duration (minutes)"
                      type="number"
                      value={securitySettings.lockoutDuration}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        lockoutDuration: parseInt(e.target.value)
                      })}
                    />
                  </Grid>
                </Grid>

                <List sx={{ mt: 2 }}>
                  <ListItem>
                    <ListItemText
                      primary="Enable Audit Log"
                      secondary="Track all admin actions"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={securitySettings.enableAuditLog}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          enableAuditLog: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Notifications Settings */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Channels
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Send notifications via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="SMS Notifications"
                      secondary="Send notifications via SMS"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Send browser push notifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => saveSettings('Notification')}
                    disabled={loading}
                  >
                    Save Notification Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Types
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="New User Registration"
                      secondary="Notify when users register"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.newUserRegistration}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          newUserRegistration: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Content Submission"
                      secondary="Notify when content is submitted"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.contentSubmission}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          contentSubmission: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="System Alerts"
                      secondary="Critical system notifications"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          systemAlerts: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Weekly Reports"
                      secondary="Send weekly activity reports"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notificationSettings.weeklyReports}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          weeklyReports: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Content Settings */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Auto-Approval Settings
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Auto-approve Jobs"
                      secondary="Automatically approve job postings"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={contentSettings.autoApproveJobs}
                        onChange={(e) => setContentSettings({
                          ...contentSettings,
                          autoApproveJobs: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Auto-approve Events"
                      secondary="Automatically approve events"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={contentSettings.autoApproveEvents}
                        onChange={(e) => setContentSettings({
                          ...contentSettings,
                          autoApproveEvents: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Auto-approve Restaurants"
                      secondary="Automatically approve restaurant listings"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={contentSettings.autoApproveRestaurants}
                        onChange={(e) => setContentSettings({
                          ...contentSettings,
                          autoApproveRestaurants: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Auto-approve Cafes"
                      secondary="Automatically approve cafe listings"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={contentSettings.autoApproveCafes}
                        onChange={(e) => setContentSettings({
                          ...contentSettings,
                          autoApproveCafes: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => saveSettings('Content')}
                    disabled={loading}
                  >
                    Save Content Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Content Features
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Enable Comments"
                      secondary="Allow users to comment on content"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={contentSettings.enableComments}
                        onChange={(e) => setContentSettings({
                          ...contentSettings,
                          enableComments: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Enable Ratings"
                      secondary="Allow users to rate content"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={contentSettings.enableRatings}
                        onChange={(e) => setContentSettings({
                          ...contentSettings,
                          enableRatings: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Moderate Comments"
                      secondary="Require approval for comments"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={contentSettings.moderateComments}
                        onChange={(e) => setContentSettings({
                          ...contentSettings,
                          moderateComments: e.target.checked
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Image Size (MB)"
                      type="number"
                      value={contentSettings.maxImageSize}
                      onChange={(e) => setContentSettings({
                        ...contentSettings,
                        maxImageSize: parseInt(e.target.value)
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Content Retention (days)"
                      type="number"
                      value={contentSettings.contentRetentionDays}
                      onChange={(e) => setContentSettings({
                        ...contentSettings,
                        contentRetentionDays: parseInt(e.target.value)
                      })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Email Settings */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Email Configuration
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Email Provider</InputLabel>
                      <Select
                        value={emailSettings.emailProvider}
                        label="Email Provider"
                        onChange={(e) => setEmailSettings({ ...emailSettings, emailProvider: e.target.value })}
                      >
                        <MenuItem value="sendgrid">SendGrid</MenuItem>
                        <MenuItem value="mailgun">Mailgun</MenuItem>
                        <MenuItem value="ses">Amazon SES</MenuItem>
                        <MenuItem value="smtp">Custom SMTP</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="API Key"
                      type={showPassword ? 'text' : 'password'}
                      value={emailSettings.apiKey}
                      onChange={(e) => setEmailSettings({ ...emailSettings, apiKey: e.target.value })}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="From Email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="From Name"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    />
                  </Grid>
                </Grid>

                {emailSettings.emailProvider === 'smtp' && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      SMTP Configuration
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="SMTP Host"
                          value={emailSettings.smtpHost}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="SMTP Port"
                          type="number"
                          value={emailSettings.smtpPort}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="SMTP Username"
                          value={emailSettings.smtpUsername}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="SMTP Password"
                          type="password"
                          value={emailSettings.smtpPassword}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => saveSettings('Email')}
                    disabled={loading}
                  >
                    Save Email Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Profile Settings */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profileSettings.firstName}
                      onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profileSettings.lastName}
                      onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileSettings.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Change Password
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={profileSettings.currentPassword}
                      onChange={(e) => setProfileSettings({ ...profileSettings, currentPassword: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={profileSettings.newPassword}
                      onChange={(e) => setProfileSettings({ ...profileSettings, newPassword: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={profileSettings.confirmPassword}
                      onChange={(e) => setProfileSettings({ ...profileSettings, confirmPassword: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={saveProfile}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Update Profile'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Picture
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{ width: 120, height: 120 }}
                    src={user?.profileImage || user?.photoURL}
                  >
                    {user?.firstName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </Avatar>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                  >
                    Upload Photo
                    <input type="file" accept="image/*" hidden />
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* API Keys */}
      {activeTab === 6 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    API Keys
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setApiKeyDialog(true)}
                  >
                    Generate API Key
                  </Button>
                </Box>

                <List>
                  {apiKeys.map((key) => (
                    <ListItem key={key.id} divider>
                      <ListItemText
                        primary={key.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Key: {key.key.substring(0, 20)}...
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {key.permissions.map((permission) => (
                                <Chip
                                  key={permission}
                                  label={permission}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Created: {key.createdAt?.toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => deleteApiKey(key.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {apiKeys.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="No API keys generated"
                        secondary="Generate your first API key to get started"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialog} onClose={() => setApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New API Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="API Key Name"
            value={newApiKey.name}
            onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
            sx={{ mt: 2 }}
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Permissions
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={newApiKey.permissions.includes('read')}
                onChange={(e) => {
                  const permissions = e.target.checked
                    ? [...newApiKey.permissions, 'read']
                    : newApiKey.permissions.filter(p => p !== 'read');
                  setNewApiKey({ ...newApiKey, permissions });
                }}
              />
            }
            label="Read Access"
          />
          <FormControlLabel
            control={
              <Switch
                checked={newApiKey.permissions.includes('write')}
                onChange={(e) => {
                  const permissions = e.target.checked
                    ? [...newApiKey.permissions, 'write']
                    : newApiKey.permissions.filter(p => p !== 'write');
                  setNewApiKey({ ...newApiKey, permissions });
                }}
              />
            }
            label="Write Access"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialog(false)}>Cancel</Button>
          <Button onClick={generateApiKey} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
