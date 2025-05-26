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
  Link,
  Rating,
} from '@mui/material';
import {
  Edit,
  Close,
  LocationOn,
  Phone,
  Email,
  Language,
  CalendarToday,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';
import { formatDate } from '../../utils/helpers';

const RestaurantViewModal = ({ open, restaurant, onClose, onEdit }) => {
  if (!restaurant) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatHours = (hours) => {
    if (!hours) return {};
    
    const daysOfWeek = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
      { key: 'saturday', label: 'Saturday' },
      { key: 'sunday', label: 'Sunday' },
    ];

    return daysOfWeek.map(day => ({
      day: day.label,
      hours: hours[day.key] || 'Not specified'
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Restaurant Details</Typography>
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
          {/* Header Information */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" gutterBottom>
                {restaurant.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {restaurant.cuisine} Cuisine
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={restaurant.status}
                  color={getStatusColor(restaurant.status)}
                  variant="outlined"
                />
                <Chip label={restaurant.category} variant="outlined" />
                <Chip label={restaurant.priceRange} variant="outlined" />
                {restaurant.featured && (
                  <Chip label="Featured" color="primary" variant="outlined" />
                )}
              </Box>
              {restaurant.rating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={restaurant.rating} readOnly precision={0.5} />
                  <Typography variant="body2">
                    ({restaurant.rating}/5)
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
              {restaurant.description}
            </Typography>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Location
                </Typography>
                <Typography variant="body2">
                  {restaurant.location?.address}
                </Typography>
                <Typography variant="body2">
                  {restaurant.location?.city}, {restaurant.location?.province}
                </Typography>
                {restaurant.location?.postalCode && (
                  <Typography variant="body2">
                    {restaurant.location.postalCode}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Price Range */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Price Range
                </Typography>
                <Typography variant="body2">
                  {restaurant.priceRange}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Link href={`tel:${restaurant.contactInfo?.phone}`} underline="hover">
                    {restaurant.contactInfo?.phone}
                  </Link>
                </Box>
              </Grid>
              
              {restaurant.contactInfo?.email && (
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={`mailto:${restaurant.contactInfo.email}`} underline="hover">
                      {restaurant.contactInfo.email}
                    </Link>
                  </Box>
                </Grid>
              )}
              
              {restaurant.contactInfo?.website && (
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={restaurant.contactInfo.website} target="_blank" underline="hover">
                      Visit Website
                    </Link>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Operating Hours */}
          {restaurant.hours && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Operating Hours
              </Typography>
              <Grid container spacing={1}>
                {formatHours(restaurant.hours).map((dayInfo, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {dayInfo.day}:
                      </Typography>
                      <Typography variant="body2">
                        {dayInfo.hours}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Features */}
          {restaurant.features && restaurant.features.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features & Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {restaurant.features.map((feature, index) => (
                  <Chip key={index} label={feature} variant="outlined" color="success" />
                ))}
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Metadata */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Restaurant Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Added
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(restaurant.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {restaurant.updatedAt && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(restaurant.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onEdit} variant="contained" startIcon={<Edit />}>
          Edit Restaurant
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestaurantViewModal;
