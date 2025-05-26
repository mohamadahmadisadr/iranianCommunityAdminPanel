import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit,
  Close,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Person,
  Settings,
  AdminPanelSettings,
  Verified,
  Login,
} from '@mui/icons-material';
import { formatDate } from '../../utils/helpers';

const UserViewModal = ({ open, user, onClose, onEdit }) => {
  if (!user) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      case 'banned':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'moderator':
        return 'info';
      case 'content_manager':
        return 'secondary';
      case 'user':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatRole = (role) => {
    return role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User';
  };

  const getFullAddress = (address) => {
    if (!address) return null;
    const parts = [address.street, address.city, address.province, address.postalCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ width: 56, height: 56 }}
              src={user.photoURL}
            >
              {user.displayName?.charAt(0) || user.firstName?.charAt(0) || user.email?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={onEdit} color="primary">
              <Edit />
            </IconButton>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Status and Role */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Unknown'}
                color={getStatusColor(user.status)}
                variant="outlined"
              />
              <Chip
                label={formatRole(user.role)}
                color={getRoleColor(user.role)}
                variant="outlined"
                icon={<AdminPanelSettings />}
              />
              {user.emailVerified && (
                <Chip
                  label="Email Verified"
                  color="success"
                  variant="outlined"
                  icon={<Verified />}
                />
              )}
              {user.phoneVerified && (
                <Chip
                  label="Phone Verified"
                  color="success"
                  variant="outlined"
                  icon={<Verified />}
                />
              )}
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={user.email}
                />
              </ListItem>
              {user.phone && (
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={user.phone}
                  />
                </ListItem>
              )}
              {getFullAddress(user.address) && (
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={getFullAddress(user.address)}
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CalendarToday />
                </ListItemIcon>
                <ListItemText
                  primary="Registration Date"
                  secondary={formatDate(user.registrationDate || user.createdAt)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Login />
                </ListItemIcon>
                <ListItemText
                  primary="Last Login"
                  secondary={user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                />
              </ListItem>
              {user.loginCount !== undefined && (
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Login Count"
                    secondary={user.loginCount || 0}
                  />
                </ListItem>
              )}
              {user.lastActivity && (
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Activity"
                    secondary={formatDate(user.lastActivity)}
                  />
                </ListItem>
              )}
            </List>
          </Grid>

          {/* Preferences */}
          {user.preferences && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Language
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.preferences.language === 'en' ? 'English' :
                     user.preferences.language === 'fa' ? 'Persian (فارسی)' :
                     user.preferences.language === 'fr' ? 'French' :
                     user.preferences.language || 'English'}
                  </Typography>
                </Grid>
                
                {user.preferences.notifications && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notifications
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {user.preferences.notifications.email && (
                        <Chip label="Email" size="small" variant="outlined" />
                      )}
                      {user.preferences.notifications.push && (
                        <Chip label="Push" size="small" variant="outlined" />
                      )}
                      {user.preferences.notifications.sms && (
                        <Chip label="SMS" size="small" variant="outlined" />
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}

          {/* Admin Notes */}
          {user.adminNotes && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Admin Notes
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {user.adminNotes}
              </Typography>
            </Grid>
          )}

          {/* Metadata */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Created: {formatDate(user.createdAt)}
                </Typography>
                {user.createdBy && (
                  <Typography variant="body2" color="text.secondary">
                    Created by: {user.createdBy}
                  </Typography>
                )}
              </Grid>
              
              {user.updatedAt && (
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {formatDate(user.updatedAt)}
                  </Typography>
                  {user.updatedBy && (
                    <Typography variant="body2" color="text.secondary">
                      Updated by: {user.updatedBy}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onEdit} variant="contained" startIcon={<Edit />}>
          Edit User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserViewModal;
