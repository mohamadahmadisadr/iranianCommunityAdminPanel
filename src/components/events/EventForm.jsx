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
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useSelector } from 'react-redux';
import { EVENT_CATEGORIES, PROVINCES, CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Event title is required'),
  description: yup.string().required('Event description is required'),
  organizer: yup.string().required('Organizer name is required'),
  category: yup.string().required('Category is required'),
  eventDate: yup.date().required('Event date is required'),
  endDate: yup.date(),
  eventTime: yup.string().required('Event time is required'),
  endTime: yup.string(),
  location: yup.object({
    venue: yup.string().required('Venue is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    province: yup.string().required('Province is required'),
    isOnline: yup.boolean(),
    onlineLink: yup.string().when('isOnline', {
      is: true,
      then: (schema) => schema.url('Invalid URL').required('Online link is required'),
      otherwise: (schema) => schema,
    }),
  }),
  ticketPrice: yup.number().min(0, 'Price must be positive'),
  maxAttendees: yup.number().min(1, 'Must allow at least 1 attendee'),
  contactEmail: yup.string().email('Invalid email').required('Contact email is required'),
  contactPhone: yup.string(),
  registrationUrl: yup.string().url('Invalid URL'),
  status: yup.string().required('Status is required'),
  featured: yup.boolean().default(false),
});

const EventForm = ({ open, event, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      organizer: '',
      category: '',
      eventDate: '',
      endDate: '',
      eventTime: '',
      endTime: '',
      location: {
        venue: '',
        address: '',
        city: '',
        province: '',
        isOnline: false,
        onlineLink: '',
      },
      ticketPrice: '',
      maxAttendees: '',
      contactEmail: '',
      contactPhone: '',
      registrationUrl: '',
      status: 'pending',
      featured: false,
    },
  });

  const watchIsOnline = watch('location.isOnline');

  useEffect(() => {
    if (event) {
      reset({
        ...event,
        eventDate: event.eventDate ? event.eventDate.toISOString().split('T')[0] : '',
        endDate: event.endDate ? event.endDate.toISOString().split('T')[0] : '',
        eventTime: event.eventTime || '',
        endTime: event.endTime || '',
        ticketPrice: event.ticketPrice || '',
        maxAttendees: event.maxAttendees || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        organizer: '',
        category: '',
        eventDate: '',
        endDate: '',
        eventTime: '',
        endTime: '',
        location: {
          venue: '',
          address: '',
          city: '',
          province: '',
          isOnline: false,
          onlineLink: '',
        },
        ticketPrice: '',
        maxAttendees: '',
        contactEmail: '',
        contactPhone: '',
        registrationUrl: '',
        status: 'pending',
        featured: false,
      });
    }
  }, [event, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const eventData = {
        ...data,
        eventDate: new Date(data.eventDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        ticketPrice: data.ticketPrice ? Number(data.ticketPrice) : null,
        maxAttendees: data.maxAttendees ? Number(data.maxAttendees) : null,
        updatedAt: serverTimestamp(),
      };

      if (event) {
        // Update existing event
        await updateDoc(doc(db, 'events', event.id), eventData);
        toast.success('Event updated successfully');
      } else {
        // Create new event
        await addDoc(collection(db, 'events'), {
          ...eventData,
          userId: user.uid,
          attendees: 0,
          createdAt: serverTimestamp(),
        });
        toast.success('Event created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {event ? 'Edit Event' : 'Add New Event'}
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
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Event Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="organizer"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Organizer"
                    error={!!errors.organizer}
                    helperText={errors.organizer?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Event Description"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {EVENT_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Date and Time */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Date & Time
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Event Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.eventDate}
                    helperText={errors.eventDate?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="eventTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Start Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.eventTime}
                    helperText={errors.eventTime?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="End Date (Optional)"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="End Time (Optional)"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="location.isOnline"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Online event"
                  />
                )}
              />
            </Grid>
            
            {watchIsOnline ? (
              <Grid item xs={12}>
                <Controller
                  name="location.onlineLink"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Online Event Link"
                      placeholder="https://zoom.us/j/..."
                      error={!!errors.location?.onlineLink}
                      helperText={errors.location?.onlineLink?.message}
                    />
                  )}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.venue"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Venue Name"
                        error={!!errors.location?.venue}
                        helperText={errors.location?.venue?.message}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Address"
                        error={!!errors.location?.address}
                        helperText={errors.location?.address?.message}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.city"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>City</InputLabel>
                        <Select {...field} label="City">
                          {CITIES.map((city) => (
                            <MenuItem key={city} value={city}>
                              {city}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.province"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Province</InputLabel>
                        <Select {...field} label="Province">
                          {PROVINCES.map((province) => (
                            <MenuItem key={province} value={province}>
                              {province}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Pricing and Capacity */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Pricing & Capacity
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="ticketPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Ticket Price"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Leave empty for free events"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="maxAttendees"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Maximum Attendees"
                    type="number"
                    helperText="Leave empty for unlimited"
                  />
                )}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contact Email"
                    type="email"
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contact Phone"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="registrationUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Registration URL"
                    placeholder="https://eventbrite.com/..."
                  />
                )}
              />
            </Grid>

            {/* Status and Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Status & Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Featured event (appears at top of listings)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : event ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventForm;
