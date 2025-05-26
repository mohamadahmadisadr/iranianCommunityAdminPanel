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
  AttachMoney,
  LocalCafe,
} from '@mui/icons-material';
import { formatDate } from '../../utils/helpers';

const CafeViewModal = ({ open, cafe, onClose, onEdit }) => {
  if (!cafe) return null;

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
          <Typography variant="h6">Cafe Details</Typography>
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
                {cafe.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Specialty: {cafe.specialty}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={cafe.status}
                  color={getStatusColor(cafe.status)}
                  variant="outlined"
                />
                <Chip label={cafe.category} variant="outlined" />
                <Chip label={cafe.priceRange} variant="outlined" />
                {cafe.featured && (
                  <Chip label="Featured" color="primary" variant="outlined" />
                )}
              </Box>
              {cafe.rating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={cafe.rating} readOnly precision={0.5} />
                  <Typography variant="body2">
                    ({cafe.rating}/5)
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
              {cafe.description}
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
                  {cafe.location?.address}
                </Typography>
                <Typography variant="body2">
                  {cafe.location?.city}, {cafe.location?.province}
                </Typography>
                {cafe.location?.postalCode && (
                  <Typography variant="body2">
                    {cafe.location.postalCode}
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
                  {cafe.priceRange}
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
                  <Link href={`tel:${cafe.contactInfo?.phone}`} underline="hover">
                    {cafe.contactInfo?.phone}
                  </Link>
                </Box>
              </Grid>
              
              {cafe.contactInfo?.email && (
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={`mailto:${cafe.contactInfo.email}`} underline="hover">
                      {cafe.contactInfo.email}
                    </Link>
                  </Box>
                </Grid>
              )}
              
              {cafe.contactInfo?.website && (
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={cafe.contactInfo.website} target="_blank" underline="hover">
                      Visit Website
                    </Link>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Operating Hours */}
          {cafe.hours && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Operating Hours
              </Typography>
              <Grid container spacing={1}>
                {formatHours(cafe.hours).map((dayInfo, index) => (
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
          {cafe.features && cafe.features.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features & Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {cafe.features.map((feature, index) => (
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
              Cafe Information
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
                      {formatDate(cafe.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {cafe.updatedAt && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(cafe.updatedAt)}
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
          Edit Cafe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CafeViewModal;
