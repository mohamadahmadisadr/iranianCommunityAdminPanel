import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useSelector } from 'react-redux';
import { USER_ROLES, USER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  displayName: yup.string().required('Display name is required'),
  firstName: yup.string(),
  lastName: yup.string(),
  role: yup.string().required('Role is required'),
  status: yup.string().required('Status is required'),
  phone: yup.string(),
  address: yup.object({
    street: yup.string(),
    city: yup.string(),
    province: yup.string(),
    postalCode: yup.string(),
    country: yup.string().default('Canada'),
  }),
  preferences: yup.object({
    language: yup.string().default('en'),
    emailNotifications: yup.boolean().default(true),
    pushNotifications: yup.boolean().default(true),
    smsNotifications: yup.boolean().default(false),
  }),
  adminNotes: yup.string(),
});

const UserForm = ({ open, user, onClose, onSuccess }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      displayName: '',
      firstName: '',
      lastName: '',
      role: USER_ROLES.USER,
      status: USER_STATUS.ACTIVE,
      phone: '',
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Canada',
      },
      preferences: {
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
      },
      adminNotes: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email || '',
        displayName: user.displayName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || USER_ROLES.USER,
        status: user.status || USER_STATUS.ACTIVE,
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          province: user.address?.province || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'Canada',
        },
        preferences: {
          language: user.preferences?.language || 'en',
          emailNotifications: user.preferences?.notifications?.email ?? true,
          pushNotifications: user.preferences?.notifications?.push ?? true,
          smsNotifications: user.preferences?.notifications?.sms ?? false,
        },
        adminNotes: user.adminNotes || '',
      });
    } else {
      reset({
        email: '',
        displayName: '',
        firstName: '',
        lastName: '',
        role: USER_ROLES.USER,
        status: USER_STATUS.ACTIVE,
        phone: '',
        address: {
          street: '',
          city: '',
          province: '',
          postalCode: '',
          country: 'Canada',
        },
        preferences: {
          language: 'en',
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
        },
        adminNotes: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = {
        email: data.email,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: data.status,
        phone: data.phone,
        address: data.address,
        preferences: {
          language: data.preferences.language,
          notifications: {
            email: data.preferences.emailNotifications,
            push: data.preferences.pushNotifications,
            sms: data.preferences.smsNotifications,
          },
        },
        adminNotes: data.adminNotes,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      };

      if (user) {
        // Update existing user
        await updateDoc(doc(db, 'users', user.id), userData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await addDoc(collection(db, 'users'), {
          ...userData,
          createdAt: serverTimestamp(),
          registrationDate: serverTimestamp(),
          createdBy: currentUser.uid,
          emailVerified: false,
          phoneVerified: false,
          loginCount: 0,
          lastLogin: null,
          lastActivity: null,
        });
        toast.success('User created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    const currentUserRole = currentUser?.role;
    
    // Super admins can assign any role
    if (currentUserRole === USER_ROLES.SUPER_ADMIN) {
      return Object.values(USER_ROLES);
    }
    
    // Admins can assign roles up to admin level
    if (currentUserRole === USER_ROLES.ADMIN) {
      return [USER_ROLES.USER, USER_ROLES.MODERATOR, USER_ROLES.CONTENT_MANAGER, USER_ROLES.ADMIN];
    }
    
    // Moderators can only assign user and moderator roles
    if (currentUserRole === USER_ROLES.MODERATOR) {
      return [USER_ROLES.USER, USER_ROLES.MODERATOR];
    }
    
    // Default to user role only
    return [USER_ROLES.USER];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user ? user.displayName?.charAt(0) || user.email?.charAt(0) : '+'}
          </Avatar>
          <Typography variant="h6">
            {user ? 'Edit User' : 'Add New User'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={!!user} // Don't allow email changes for existing users
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="displayName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Display Name"
                    error={!!errors.displayName}
                    helperText={errors.displayName?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                  />
                )}
              />
            </Grid>

            {/* Role and Status */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Role & Status
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role">
                      {getRoleOptions().map((role) => (
                        <MenuItem key={role} value={role}>
                          {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {Object.values(USER_STATUS).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Address (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Street Address"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="City"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="address.province"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Province"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="address.postalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Postal Code"
                    placeholder="A1A 1A1"
                  />
                )}
              />
            </Grid>

            {/* Preferences */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="preferences.language"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select {...field} label="Language">
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="fa">Persian (فارسی)</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Notification Preferences
              </Typography>
              <Controller
                name="preferences.emailNotifications"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Email Notifications"
                  />
                )}
              />
              <Controller
                name="preferences.pushNotifications"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Push Notifications"
                  />
                )}
              />
              <Controller
                name="preferences.smsNotifications"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="SMS Notifications"
                  />
                )}
              />
            </Grid>

            {/* Admin Notes */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Admin Notes
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="adminNotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Admin Notes"
                    multiline
                    rows={3}
                    placeholder="Internal notes about this user..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
