import { useState, useEffect } from 'react';
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
import { addDoc, updateDoc, doc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useSelector, useDispatch } from 'react-redux';
import { addEvent, updateEvent } from '../../store/eventsSlice';
import { EVENT_CATEGORIES, PROVINCES, CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Event title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Event description is required').min(10, 'Description must be at least 10 characters'),
  organizer: yup.string().required('Organizer name is required'),
  category: yup.string().required('Category is required'),
  eventDate: yup.date().required('Event date is required').min(new Date(), 'Event date cannot be in the past'),
  endDate: yup.date().when('eventDate', {
    is: (eventDate) => !!eventDate,
    then: (schema) => schema.min(yup.ref('eventDate'), 'End date must be after event date'),
    otherwise: (schema) => schema,
  }),
  eventTime: yup.string().required('Event time is required'),
  endTime: yup.string(),
  location: yup.object({
    venue: yup.string().when('isOnline', {
      is: false,
      then: (schema) => schema.required('Venue is required for in-person events'),
      otherwise: (schema) => schema,
    }),
    address: yup.string().when('isOnline', {
      is: false,
      then: (schema) => schema.required('Address is required for in-person events'),
      otherwise: (schema) => schema,
    }),
    city: yup.string().when('isOnline', {
      is: false,
      then: (schema) => schema.required('City is required for in-person events'),
      otherwise: (schema) => schema,
    }),
    province: yup.string().when('isOnline', {
      is: false,
      then: (schema) => schema.required('Province is required for in-person events'),
      otherwise: (schema) => schema,
    }),
    isOnline: yup.boolean().default(false),
    onlineLink: yup.string().when('isOnline', {
      is: true,
      then: (schema) => schema.url('Invalid URL').required('Online link is required for online events'),
      otherwise: (schema) => schema,
    }),
  }),
  ticketPrice: yup.number().transform((value, originalValue) => {
    return originalValue === '' ? 0 : value;
  }).min(0, 'Price must be positive'),
  maxAttendees: yup.number()
    .transform((_, originalValue) => {
      // Handle empty string, null, undefined as undefined (unlimited)
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      // Convert to number
      const numValue = Number(originalValue);
      return isNaN(numValue) ? undefined : numValue;
    })
    .nullable()
    .optional()
    .test(
      'is-valid-capacity',
      'Maximum attendees must be a positive number, 0 for unlimited, or left empty',
      function(value) {
        // Allow undefined/null for unlimited attendance
        if (value === undefined || value === null) {
          return true;
        }
        // Allow 0 for unlimited attendance
        if (value === 0) {
          return true;
        }
        // If a positive number is provided, it must be a positive integer
        return Number.isInteger(value) && value > 0;
      }
    ),
  contactEmail: yup.string().email('Invalid email').required('Contact email is required'),
  contactPhone: yup.string(),
  registrationUrl: yup.string().url('Invalid URL'),
  status: yup.string().required('Status is required'),
  featured: yup.boolean().default(false),
});

// Define default values outside component to prevent recreation
const defaultValues = {
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
};

const EventForm = ({ open, event, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const watchIsOnline = watch('location.isOnline');

  useEffect(() => {
    if (event) {
      console.log('Resetting form with event data:', event);
      try {
        const formData = {
          title: event.title || '',
          description: event.description || '',
          organizer: event.organizer || '',
          category: event.category || '',
          eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
          endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
          eventTime: event.eventTime || '',
          endTime: event.endTime || '',
          ticketPrice: event.ticketPrice?.toString() || '',
          maxAttendees: (event.maxAttendees !== null && event.maxAttendees !== undefined) ? event.maxAttendees.toString() : '',
          contactEmail: event.contactEmail || '',
          contactPhone: event.contactPhone || '',
          registrationUrl: event.registrationUrl || '',
          status: event.status || 'pending',
          featured: Boolean(event.featured),
          location: {
            venue: event.location?.venue || '',
            address: event.location?.address || '',
            city: event.location?.city || '',
            province: event.location?.province || '',
            isOnline: Boolean(event.location?.isOnline),
            onlineLink: event.location?.onlineLink || '',
          },
        };
        console.log('Form data to reset:', formData);
        reset(formData);
      } catch (error) {
        console.error('Error resetting form:', error);
        toast.error('Error loading event data');
      }
    } else {
      // Reset to default values when creating new event
      reset(defaultValues);
    }
  }, [event, reset]); // Removed defaultValues from dependencies

  const onSubmit = async (data) => {
    console.log('onSubmit triggered with data:', data);

    if (loading) return; // Prevent double submission

    setLoading(true);
    try {
      // Convert form dates to Javascript Date objects for Firestore
      const currentDate = new Date();
      // Clean and transform the data
      const eventData = {
        ...data,
        eventDate: new Date(data.eventDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        ticketPrice: data.ticketPrice ? Number(data.ticketPrice) : 0,
        maxAttendees: (data.maxAttendees && data.maxAttendees !== '' && Number(data.maxAttendees) > 0) ? Number(data.maxAttendees) : null,
        status: data.status || 'pending',
        featured: Boolean(data.featured),
        updatedAt: serverTimestamp(),
      };
      console.log('Transformed event data:', eventData);

      if (event) {
        console.log('Attempting to update event with ID:', event.id);
        // Update existing event
        const eventRef = doc(db, 'events', event.id);
        await updateDoc(eventRef, eventData);
        console.log('Successfully updated in Firestore');
        
        // Get the updated document to ensure we have the latest data
        const updated = await getDoc(eventRef);
        const updatedData = updated.data();
        console.log('Retrieved updated data from Firestore:', updatedData);
        
        // Convert dates to ISO strings for Redux store
        // Helper function to safely convert timestamp to ISO string
        const convertTimestamp = (timestamp) => {
          if (!timestamp) return null;
          if (timestamp.toDate instanceof Function) {
            return timestamp.toDate().toISOString();
          }
          if (timestamp instanceof Date) {
            return timestamp.toISOString();
          }
          if (typeof timestamp === 'string') {
            return timestamp; // Already in ISO string format
          }
          return null;
        };

        const reduxData = {
          ...updatedData,
          id: event.id,
          eventDate: convertTimestamp(updatedData.eventDate),
          endDate: convertTimestamp(updatedData.endDate),
          ticketPrice: updatedData.ticketPrice || 0,
          maxAttendees: updatedData.maxAttendees || null,
          status: updatedData.status || 'pending',
          featured: updatedData.featured || false,
          createdAt: convertTimestamp(updatedData.createdAt) || convertTimestamp(event.createdAt),
          updatedAt: convertTimestamp(updatedData.updatedAt) || new Date().toISOString(),
        };
        console.log('Dispatching to Redux with data:', reduxData);
        dispatch(updateEvent(reduxData));
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const docRef = await addDoc(collection(db, 'events'), {
          ...eventData,
          userId: user.uid,
          attendees: 0,
          createdAt: serverTimestamp(),
        });
        // Convert dates to ISO strings for Redux store
        const reduxData = {
          ...eventData,
          id: docRef.id,
          eventDate: eventData.eventDate?.toISOString(),
          endDate: eventData.endDate?.toISOString(),
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString(),
        };
        dispatch(addEvent(reduxData));
        toast.success('Event created successfully');
      }

      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  // Log any validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="event-form-dialog-title"
      disableEscapeKeyDown={loading}
      disableBackdropClick={loading}
      keepMounted={false}
    >
      <DialogTitle id="event-form-dialog-title">
        {event ? 'Edit Event' : 'Add New Event'}
      </DialogTitle>
      
      <form noValidate onSubmit={handleSubmit(
        (data) => {
          console.log('Form submitted successfully with data:', data);
          return onSubmit(data);
        },
        (errors) => {
          console.log('Form validation failed:', errors);
          toast.error('Please fix the form errors');
          Object.values(errors).forEach(error => {
            if (error.message) {
              console.log(error.message);
            }
          });
        }
      )}>
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
                    id="event-title"
                    name="title"
                    value={field.value || ''}
                    fullWidth
                    label="Event Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    autoComplete="off"
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
                    id="event-organizer"
                    name="organizer"
                    value={field.value || ''}
                    fullWidth
                    label="Organizer"
                    error={!!errors.organizer}
                    helperText={errors.organizer?.message}
                    autoComplete="organization"
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
                    id="event-description"
                    name="description"
                    value={field.value || ''}
                    fullWidth
                    label="Event Description"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    autoComplete="off"
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
                    <InputLabel id="event-category-label">Category</InputLabel>
                    <Select
                      {...field}
                      id="event-category"
                      name="category"
                      value={field.value || ''}
                      label="Category"
                      labelId="event-category-label"
                    >
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
                    id="event-date"
                    name="eventDate"
                    value={field.value || ''}
                    fullWidth
                    label="Event Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.eventDate}
                    helperText={errors.eventDate?.message}
                    autoComplete="off"
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
                    id="event-time"
                    name="eventTime"
                    value={field.value || ''}
                    fullWidth
                    label="Start Time"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.eventTime}
                    helperText={errors.eventTime?.message}
                    autoComplete="off"
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
                    id="event-end-date"
                    name="endDate"
                    value={field.value || ''}
                    fullWidth
                    label="End Date (Optional)"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    autoComplete="off"
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
                    id="event-end-time"
                    name="endTime"
                    value={field.value || ''}
                    fullWidth
                    label="End Time (Optional)"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    autoComplete="off"
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
                    control={
                      <Checkbox
                        {...field}
                        id="event-is-online"
                        name="isOnline"
                        checked={Boolean(field.value)}
                      />
                    }
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
                      id="event-online-link"
                      name="onlineLink"
                      value={field.value || ''}
                      fullWidth
                      label="Online Event Link"
                      placeholder="https://zoom.us/j/..."
                      error={!!errors.location?.onlineLink}
                      helperText={errors.location?.onlineLink?.message}
                      autoComplete="url"
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
                        id="event-venue"
                        name="venue"
                        value={field.value || ''}
                        fullWidth
                        label="Venue Name"
                        error={!!errors.location?.venue}
                        helperText={errors.location?.venue?.message}
                        autoComplete="off"
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
                        id="event-address"
                        name="address"
                        value={field.value || ''}
                        fullWidth
                        label="Address"
                        error={!!errors.location?.address}
                        helperText={errors.location?.address?.message}
                        autoComplete="street-address"
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
                        <InputLabel id="event-city-label">City</InputLabel>
                        <Select
                          {...field}
                          id="event-city"
                          name="city"
                          value={field.value || ''}
                          label="City"
                          labelId="event-city-label"
                        >
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
                        <InputLabel id="event-province-label">Province</InputLabel>
                        <Select
                          {...field}
                          id="event-province"
                          name="province"
                          value={field.value || ''}
                          label="Province"
                          labelId="event-province-label"
                        >
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
                    id="event-ticket-price"
                    name="ticketPrice"
                    value={field.value || ''}
                    fullWidth
                    label="Ticket Price"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="Leave empty for free events"
                    autoComplete="off"
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
                    id="event-max-attendees"
                    name="maxAttendees"
                    value={field.value || ''}
                    fullWidth
                    label="Maximum Attendees"
                    type="number"
                    error={!!errors.maxAttendees}
                    helperText={errors.maxAttendees?.message || "Leave empty or enter 0 for unlimited attendance"}
                    autoComplete="off"
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
                    id="event-contact-email"
                    name="contactEmail"
                    value={field.value || ''}
                    fullWidth
                    label="Contact Email"
                    type="email"
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail?.message}
                    autoComplete="email"
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
                    id="event-contact-phone"
                    name="contactPhone"
                    value={field.value || ''}
                    fullWidth
                    label="Contact Phone"
                    autoComplete="tel"
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
                    id="event-registration-url"
                    name="registrationUrl"
                    value={field.value || ''}
                    fullWidth
                    label="Registration URL"
                    placeholder="https://eventbrite.com/..."
                    autoComplete="url"
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
                    <InputLabel id="event-status-label">Status</InputLabel>
                    <Select
                      {...field}
                      id="event-status"
                      name="status"
                      value={field.value || 'pending'}
                      label="Status"
                      labelId="event-status-label"
                    >
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
                    control={
                      <Checkbox
                        {...field}
                        id="event-featured"
                        name="featured"
                        checked={Boolean(field.value)}
                      />
                    }
                    label="Featured event (appears at top of listings)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            aria-label={loading ? 'Saving event' : event ? 'Update event' : 'Create event'}
          >
            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogActions>
      </form>

      {Object.keys(errors).length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mt: 2 }}>
          <Typography variant="subtitle2" color="error.main" gutterBottom>
            Please fix the following errors:
          </Typography>
          {Object.entries(errors).map(([key, error]) => {
            const message = error?.message || (typeof error === 'object' && error.message) || 'Invalid field';
            return (
              <Typography key={key} variant="caption" display="block" color="error.main">
                • {message}
              </Typography>
            );
          })}
        </Box>
      )}
    </Dialog>
  );
};

export default EventForm;
