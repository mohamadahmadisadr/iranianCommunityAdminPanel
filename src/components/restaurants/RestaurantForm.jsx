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
  Chip,
  InputAdornment,
  Rating,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useSelector } from 'react-redux';
import { RESTAURANT_CATEGORIES, PROVINCES, CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Restaurant name is required'),
  description: yup.string().required('Description is required'),
  cuisine: yup.string().required('Cuisine type is required'),
  category: yup.string().required('Category is required'),
  location: yup.object({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    province: yup.string().required('Province is required'),
    postalCode: yup.string(),
  }),
  contactInfo: yup.object({
    phone: yup.string(), // Phone number is optional for restaurants
    email: yup.string().email('Invalid email'),
    website: yup.string().url('Invalid URL'),
  }),
  hours: yup.object({
    monday: yup.string(),
    tuesday: yup.string(),
    wednesday: yup.string(),
    thursday: yup.string(),
    friday: yup.string(),
    saturday: yup.string(),
    sunday: yup.string(),
  }),
  priceRange: yup.string().required('Price range is required'),
  features: yup.array().of(yup.string()),
  status: yup.string().required('Status is required'),
  featured: yup.boolean().default(false),
});

const RestaurantForm = ({ open, restaurant, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      cuisine: '',
      category: '',
      location: {
        address: '',
        city: '',
        province: '',
        postalCode: '',
      },
      contactInfo: {
        phone: '',
        email: '',
        website: '',
      },
      hours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
      },
      priceRange: '$',
      rating: 0,
      features: [],
      status: 'pending',
      featured: false,
    },
  });

  const watchedFeatures = watch('features');

  useEffect(() => {
    if (restaurant) {
      reset({
        ...restaurant,
        rating: restaurant.rating || 0,
      });
    } else {
      reset({
        name: '',
        description: '',
        cuisine: '',
        category: '',
        location: {
          address: '',
          city: '',
          province: '',
          postalCode: '',
        },
        contactInfo: {
          phone: '',
          email: '',
          website: '',
        },
        hours: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: '',
        },
        priceRange: '$',
        rating: 0,
        features: [],
        status: 'pending',
        featured: false,
      });
    }
  }, [restaurant, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const restaurantData = {
        ...data,
        rating: Number(data.rating) || 0,
        updatedAt: serverTimestamp(),
      };

      if (restaurant) {
        // Update existing restaurant
        await updateDoc(doc(db, 'restaurants', restaurant.id), restaurantData);
        toast.success('Restaurant updated successfully');
      } else {
        // Create new restaurant
        await addDoc(collection(db, 'restaurants'), {
          ...restaurantData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        toast.success('Restaurant created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Failed to save restaurant');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setValue('features', [...watchedFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setValue('features', watchedFeatures.filter((_, i) => i !== index));
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
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
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Restaurant Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cuisine"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cuisine Type"
                    placeholder="e.g., Persian, Italian, Chinese"
                    error={!!errors.cuisine}
                    helperText={errors.cuisine?.message}
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
                    label="Description"
                    multiline
                    rows={3}
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
                      {RESTAURANT_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="priceRange"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Price Range</InputLabel>
                    <Select {...field} label="Price Range">
                      <MenuItem value="$">$ - Budget Friendly</MenuItem>
                      <MenuItem value="$$">$$ - Moderate</MenuItem>
                      <MenuItem value="$$$">$$$ - Expensive</MenuItem>
                      <MenuItem value="$$$$">$$$$ - Very Expensive</MenuItem>
                    </Select>
                  </FormControl>
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

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
              <Controller
                name="location.postalCode"
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

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactInfo.phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number (Optional)"
                    placeholder="(555) 123-4567"
                    error={!!errors.contactInfo?.phone}
                    helperText={errors.contactInfo?.phone?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactInfo.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.contactInfo?.email}
                    helperText={errors.contactInfo?.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="contactInfo.website"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Website"
                    placeholder="https://restaurant.com"
                  />
                )}
              />
            </Grid>

            {/* Operating Hours */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Operating Hours
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Format: "9:00 AM - 10:00 PM" or "Closed"
              </Typography>
            </Grid>

            {daysOfWeek.map((day) => (
              <Grid item xs={12} md={6} key={day.key}>
                <Controller
                  name={`hours.${day.key}`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={day.label}
                      placeholder="9:00 AM - 10:00 PM"
                    />
                  )}
                />
              </Grid>
            ))}

            {/* Features */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features & Amenities
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Feature"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  placeholder="e.g., Outdoor Seating, Halal, Vegetarian Options"
                />
                <Button variant="outlined" onClick={addFeature}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {watchedFeatures.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => removeFeature(index)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Rating and Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Rating & Status
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Rating
                    </Typography>
                    <Rating
                      {...field}
                      value={Number(field.value) || 0}
                      onChange={(event, newValue) => {
                        field.onChange(newValue);
                      }}
                      precision={0.5}
                    />
                  </Box>
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
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
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
                    label="Featured restaurant (appears at top of listings)"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : restaurant ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RestaurantForm;
