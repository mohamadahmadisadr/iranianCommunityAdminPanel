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
} from '@mui/material';
import {
  Edit,
  Close,
  LocationOn,
  Event as EventIcon,
  AttachMoney,
  Email,
  Phone,
  Language,
  CalendarToday,
  People,
  AccessTime,
  VideoCall,
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '../../utils/helpers';

const EventViewModal = ({ open, event, onClose, onEdit }) => {
  if (!event) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const isEventPast = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  const formatEventDateTime = (date, time) => {
    if (!date) return '';
    const dateStr = formatDate(date);
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Event Details</Typography>
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
                {event.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Organized by {event.organizer}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={event.status}
                  color={getStatusColor(event.status)}
                  variant="outlined"
                />
                <Chip label={event.category} variant="outlined" />
                {event.featured && (
                  <Chip label="Featured" color="primary" variant="outlined" />
                )}
                {isEventPast(event.eventDate) && (
                  <Chip label="Past Event" color="default" variant="outlined" />
                )}
                {event.ticketPrice === 0 || !event.ticketPrice ? (
                  <Chip label="Free" color="success" variant="outlined" />
                ) : (
                  <Chip label={`$${event.ticketPrice}`} color="info" variant="outlined" />
                )}
              </Box>
            </Box>
          </Grid>

          {/* Date and Time */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Date & Time
                </Typography>
                <Typography variant="body2">
                  {formatEventDateTime(event.eventDate, event.eventTime)}
                </Typography>
                {event.endDate && (
                  <Typography variant="body2" color="text.secondary">
                    Ends: {formatEventDateTime(event.endDate, event.endTime)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {event.location?.isOnline ? (
                <VideoCall sx={{ mr: 1, color: 'text.secondary' }} />
              ) : (
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              )}
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  Location
                </Typography>
                {event.location?.isOnline ? (
                  <Typography variant="body2">
                    Online Event
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body2">
                      {event.location?.venue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location?.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location?.city}, {event.location?.province}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Attendees */}
          {(event.attendees !== undefined || event.maxAttendees) && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Attendees
                  </Typography>
                  <Typography variant="body2">
                    {event.attendees || 0}
                    {event.maxAttendees && ` / ${event.maxAttendees}`} registered
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Price */}
          {event.ticketPrice !== undefined && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Ticket Price
                  </Typography>
                  <Typography variant="body2">
                    {event.ticketPrice === 0 || !event.ticketPrice
                      ? 'Free'
                      : formatCurrency(event.ticketPrice)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Event Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
              {event.description}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Link href={`mailto:${event.contactEmail}`} underline="hover">
                    {event.contactEmail}
                  </Link>
                </Box>
              </Grid>
              
              {event.contactPhone && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={`tel:${event.contactPhone}`} underline="hover">
                      {event.contactPhone}
                    </Link>
                  </Box>
                </Grid>
              )}
              
              {event.registrationUrl && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Language sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={event.registrationUrl} target="_blank" underline="hover">
                      Registration Link
                    </Link>
                  </Box>
                </Grid>
              )}
              
              {event.location?.isOnline && event.location?.onlineLink && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <VideoCall sx={{ mr: 1, color: 'text.secondary' }} />
                    <Link href={event.location.onlineLink} target="_blank" underline="hover">
                      Join Online Event
                    </Link>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Metadata */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Event Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(event.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              {event.updatedAt && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(event.updatedAt)}
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
          Edit Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventViewModal;
